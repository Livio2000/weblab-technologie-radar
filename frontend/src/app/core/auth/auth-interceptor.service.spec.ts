import { makeEnvironmentProviders } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from "@angular/common/http";
import { authInterceptor } from "./auth-interceptor.service";
import { AuthService } from "./auth.service";

describe('authInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    const authServiceSpy = { logout: jest.fn() };

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                makeEnvironmentProviders(provideHttpClientTesting()),
                { provide: AuthService, useValue: authServiceSpy },
            ],
        });
        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        authServiceSpy.logout.mockClear();
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('adds the Authorization header when a token is stored', () => {
        localStorage.setItem('token', 'my-token');

        http.get('/v1/technologies').subscribe();

        const req = httpMock.expectOne('/v1/technologies');
        expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
        req.flush([]);
    });

    it('sends no Authorization header without a token', () => {
        http.get('/v1/technologies').subscribe();

        const req = httpMock.expectOne('/v1/technologies');
        expect(req.request.headers.get('Authorization')).toBeNull();
        req.flush([]);
    });

    it('logs the user out on a 401, then re-throws', () => {
        const errorSpy = jest.fn();
        http.get('/v1/technologies').subscribe({ error: errorSpy });

        const req = httpMock.expectOne('/v1/technologies');
        req.flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(authServiceSpy.logout).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
    });

    it('leaves the session untouched on a non-401 error', () => {
        const errorSpy = jest.fn();
        http.get('/v1/technologies').subscribe({ error: errorSpy });

        const req = httpMock.expectOne('/v1/technologies');
        req.flush(null, { status: 500, statusText: 'Internal Server Error' });

        expect(authServiceSpy.logout).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
    });
});