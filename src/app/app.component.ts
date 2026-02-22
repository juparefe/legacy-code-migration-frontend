import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MigrateApiService } from './migrate-api.service';
import { MigrateResponse, RuleId, RuleToggle } from './types';

const ALL_RULES: { id: RuleId; label: string }[] = [
  { id: 'R1', label: 'R1 IF/ELSE/END-IF → if/else' },
  { id: 'R2', label: 'R2 DISPLAY → logger.info' },
  { id: 'R3', label: 'R3 MOVE → asignación' },
  { id: 'R4', label: 'R4 ADD → +=' },
  { id: 'R5', label: 'R5 SUBTRACT → -=' },
  { id: 'R6', label: 'R6 PERFORM → while/for (heurístico)' },
  { id: 'R7', label: 'R7 EVALUATE → switch/case' },
  { id: 'R8', label: 'R8 Comentarios → //' }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  readonly rules = ALL_RULES;

  readonly loading = signal(false);
  readonly errorMsg = signal<string | null>(null);
  readonly result = signal<MigrateResponse | null>(null);

  form = this.fb.group({
    sourceLanguage: this.fb.nonNullable.control<'COBOL'|'DELPHI'>('COBOL'),
    targetLanguage: this.fb.nonNullable.control<'NODE'>('NODE'),
    code: this.fb.nonNullable.control<string>(`IF AMOUNT > 0
DISPLAY "VALID"
ELSE
DISPLAY "INVALID"
END-IF`),

    // Modo de envío de reglas: array de ids o objeto con toggles
    ruleMode: this.fb.nonNullable.control<'ARRAY'|'OBJECT'>('ARRAY'),

    // Por simplicidad, un toggle por regla. Si no se selecciona ninguna, se envían todas.
    enabledRules: this.fb.nonNullable.group(
      ALL_RULES.reduce((acc, r) => {
        acc[r.id] = this.fb.nonNullable.control(true);
        return acc;
      }, {} as Record<RuleId, any>)
    )
  });

  selectedRuleCount = computed(() => {
    const v = this.form.getRawValue().enabledRules;
    return Object.values(v).filter(Boolean).length;
  });

  constructor(private fb: FormBuilder, private api: MigrateApiService) {}

  buildRulesPayload(): RuleToggle {
    const enabled = this.form.getRawValue().enabledRules;

    const enabledIds = Object.entries(enabled)
      .filter(([, isOn]) => isOn)
      .map(([id]) => id as RuleId);

    // En la opcion de array si no seleccionó ninguna, enviamos todas
    const finalIds = enabledIds.length > 0
      ? enabledIds
      : this.rules.map(r => r.id);

    if (this.form.getRawValue().ruleMode === 'ARRAY') {
      return finalIds;
    }

    // En modo objeto, enviamos un objeto con true/false. Si no se seleccionó ninguna, enviamos todas como true
    const obj: Partial<Record<RuleId, boolean>> = {};
    for (const r of this.rules) obj[r.id] = !!enabled[r.id];
    return obj;
  }

  selectAll(on: boolean) {
    for (const r of this.rules) {
      this.form.controls.enabledRules.controls[r.id].setValue(on);
    }
  }

  run() {
    this.errorMsg.set(null);
    this.result.set(null);

    const raw = this.form.getRawValue();

    const payload = {
      sourceLanguage: raw.sourceLanguage,
      targetLanguage: raw.targetLanguage,
      code: raw.code,
      rules: this.buildRulesPayload()
    };

    this.loading.set(true);
    this.api.migrate(payload).subscribe({
      next: (res) => {
        this.result.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ||
          err?.message ||
          'Error llamando al backend. Revisa que esté corriendo en localhost:3000';
        this.errorMsg.set(msg);
      }
    });
  }
}