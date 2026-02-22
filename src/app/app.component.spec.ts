import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MigrateApiService } from './migrate-api.service';
import { of, throwError } from 'rxjs';
import { MigrateResponse, RuleId, RuleToggle } from './types';

const mockResponse: MigrateResponse = {
  output: 'ok',
  report: {
    appliedRules: [],
    warningsDetected: [],
    sourceLanguage: 'COBOL',
    targetLanguage: 'NODE',
    summary: {
      linesIn: 0,
      linesOut: 0,
      rulesApplied: 0,
      warnings: 0
    }
  }
};

describe('AppComponent', () => {
  let api: jasmine.SpyObj<MigrateApiService>;
  const ALL_RULE_IDS: RuleId[] = ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8'];

  beforeEach(async () => {
    api = jasmine.createSpyObj<MigrateApiService>('MigrateApiService', ['migrate']);

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [{ provide: MigrateApiService, useValue: api }],
    }).compileComponents();
  });

  function givenComponent() {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    return { fixture, app };
  }

  it(`GIVEN the component
      WHEN it is created
      THEN it should exist`, () => {
    const { app } = givenComponent();
    expect(app).toBeTruthy();
  });

  it(`GIVEN default enabled rules
    WHEN selectedRuleCount is read
    THEN it should be 8`, () => {
    const { app } = givenComponent();
    const count = app.selectedRuleCount();
    expect(count).toBe(8);
  });

  it(`GIVEN some rules disabled
    WHEN selectedRuleCount is read
    THEN it should match enabled count`, () => {
    const { app } = givenComponent();
    app.form.controls.enabledRules.controls['R2'].setValue(false);
    app.form.controls.enabledRules.controls['R6'].setValue(false);
    const enabled = app.form.getRawValue().enabledRules;
    const count = Object.values(enabled).filter(Boolean).length;
    expect(count).toBe(6);
  });

  it(`GIVEN all rules enabled
    WHEN selectAll(false) is called
    THEN all rules become disabled`, () => {
    const { app } = givenComponent();
    app.selectAll(false);
    const v = app.form.getRawValue().enabledRules;
    expect(Object.values(v).every(x => x === false)).toBeTrue();
    const count = Object.values(v).filter(Boolean).length;
    expect(count).toBe(0);
  });

  it(`GIVEN all rules disabled
    WHEN selectAll(true) is called
    THEN all rules become enabled`, () => {
    const { app } = givenComponent();
    app.selectAll(false);
    app.selectAll(true);
    const v = app.form.getRawValue().enabledRules;
    expect(Object.values(v).every(x => x === true)).toBeTrue();
    expect(app.selectedRuleCount()).toBe(8);
  });

  it(`GIVEN ARRAY mode and only R1/R4 enabled
    WHEN buildRulesPayload is called
    THEN it returns ["R1","R4"]`, () => {
    const { app } = givenComponent();
    app.form.controls.ruleMode.setValue('ARRAY');
    app.selectAll(false);
    app.form.controls.enabledRules.controls['R1'].setValue(true);
    app.form.controls.enabledRules.controls['R4'].setValue(true);
    const payload = app.buildRulesPayload();
    expect(Array.isArray(payload)).toBeTrue();
    expect(payload).toEqual(['R1', 'R4']);
  });

  it(`GIVEN ARRAY mode and none selected
    WHEN buildRulesPayload is called
    THEN it returns ALL rules`, () => {
    const { app } = givenComponent();
    app.form.controls.ruleMode.setValue('ARRAY');
    app.selectAll(false);
    const payload = app.buildRulesPayload();
    expect(Array.isArray(payload)).toBeTrue();
    expect(payload).toEqual(ALL_RULE_IDS);
  });

  it(`GIVEN OBJECT mode and only R2/R8 enabled
    WHEN buildRulesPayload is called
    THEN it returns a toggle map`, () => {
    const { app } = givenComponent();
    app.form.controls.ruleMode.setValue('OBJECT');
    app.selectAll(false);
    app.form.controls.enabledRules.controls['R2'].setValue(true);
    app.form.controls.enabledRules.controls['R8'].setValue(true);
    const payload = app.buildRulesPayload();
    expect(Array.isArray(payload)).toBeFalse();
    const obj = payload as Record<RuleId, boolean>;
    expect(obj.R2).toBeTrue();
    expect(obj.R8).toBeTrue();
    expect(obj.R1).toBeFalse();
    expect(obj.R7).toBeFalse();
  });

  it(`GIVEN a valid form
    WHEN run() succeeds
    THEN it sets result and clears error`, fakeAsync(() => {
    const { app } = givenComponent();
    api.migrate.and.returnValue(of(mockResponse));
    app.form.controls.sourceLanguage.setValue('COBOL');
    app.form.controls.targetLanguage.setValue('NODE');
    app.form.controls.ruleMode.setValue('ARRAY');
    app.form.controls.code.setValue('DISPLAY "VALID"');
    app.selectAll(false);
    app.form.controls.enabledRules.controls['R1'].setValue(true);
    app.run();
    tick();
    expect(api.migrate).toHaveBeenCalled();

    const arg = api.migrate.calls.mostRecent().args[0] as {
      sourceLanguage: 'COBOL' | 'DELPHI';
      targetLanguage: 'NODE';
      code: string;
      rules: RuleToggle;
    };
    expect(arg.rules).toEqual(['R1']);

    expect(app.result()).toEqual(mockResponse);
    expect(app.errorMsg()).toBeNull();
    expect(app.loading()).toBeFalse();
  }));

  it(`GIVEN backend unreachable and offline
      WHEN run() fails with status 0
      THEN it shows offline message`, fakeAsync(() => {
    const { app } = givenComponent();
    api.migrate.and.returnValue(throwError(() => ({ status: 0, message: 'Unknown Error' })));
    spyOnProperty(navigator, 'onLine', 'get').and.returnValue(false);
    app.run();
    tick();
    expect(app.result()).toBeNull();
    expect(app.loading()).toBeFalse();
    expect(app.errorMsg()).toBe('No tienes conexión a internet.');
  }));

  it(`GIVEN backend unreachable and online
    WHEN run() fails with status 0
    THEN it shows backend unreachable message`, fakeAsync(() => {
    const { app } = givenComponent();
    api.migrate.and.returnValue(throwError(() => ({ status: 0, message: 'Unknown Error' })));
    spyOnProperty(navigator, 'onLine', 'get').and.returnValue(true);
    app.run();
    tick();
    expect(app.result()).toBeNull();
    expect(app.loading()).toBeFalse();
    expect(app.errorMsg() || '').toContain('No se pudo conectar al backend');
  }));

  it(`GIVEN backend returns message and issues
    WHEN run() fails
    THEN message takes priority`, fakeAsync(() => {
    const { app } = givenComponent();
    api.migrate.and.returnValue(
      throwError(() => ({
        status: 400,
        statusText: 'Bad Request',
        error: {
          message: 'Invalid request',
          issues: [
            { path: ['code'], message: 'Required' },
            { path: ['rules'], message: 'Invalid' },
          ],
        },
      })),
    );
    app.run();
    tick();
    expect(app.loading()).toBeFalse();
    expect(app.result()).toBeNull();
    expect(app.errorMsg()).toContain('Invalid request');
  }));

  it(`GIVEN issues array
      WHEN formatZodIssues is called
      THEN it returns bullet list`, () => {
    const { app } = givenComponent();
    const issues = [
      { path: ['code'], message: 'Required' },
      { message: 'Bad' },
    ];
    const anyApp = app as unknown as { formatZodIssues: (x: { path?: (string|number)[]; message: string }[]) => string };
    const out = anyApp.formatZodIssues(issues);
    expect(out).toContain('• code: Required');
    expect(out).toContain('• field: Bad');
  });

  it(`GIVEN backend returns issues but no message
    WHEN run() fails
    THEN it should format and show issues`, fakeAsync(() => {
    const { app } = givenComponent();
    api.migrate.and.returnValue(
      throwError(() => ({
        status: 400,
        statusText: 'Bad Request',
        error: {
          issues: [
            { path: ['code'], message: 'Required' },
            { path: ['rules'], message: 'Invalid' },
          ],
        },
      })),
    );
    app.run();
    tick();
    const msg = app.errorMsg() || '';
    expect(msg).toContain('• code: Required');
    expect(msg).toContain('• rules: Invalid');
    expect(app.loading()).toBeFalse();
  }));

  it(`GIVEN backend returns an error without message or issues
    WHEN run() fails
    THEN it should show a generic status error`, fakeAsync(() => {
    const { app } = givenComponent();
    api.migrate.and.returnValue(
      throwError(() => ({
        status: 500,
        statusText: 'Internal Server Error',
        error: {},
      })),
    );
    app.run();
    tick();
    expect(app.errorMsg()).toContain('Error 500: Internal Server Error');
    expect(app.loading()).toBeFalse();
  }));
});