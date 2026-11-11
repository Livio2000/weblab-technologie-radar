import { makeEnvironmentProviders } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from "@angular/common/http";
import { Router } from "@angular/router";
import { authInterceptor } from "./auth-interceptor.service";

describe('authInterceptor', () => {
    let http: HttpClient;
    let httpMock: HttpTestingController;
    const routerMock = { navigate: jest.fn() };

    beforeEach(() => {
        localStorage.clear();
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptors([authInterceptor])),
                makeEnvironmentProviders(provideHttpClientTesting()),
                { provide: Router, useValue: routerMock },
            ],
        });
        http = TestBed.inject(HttpClient);
        httpMock = TestBed.inject(HttpTestingController);
        routerMock.navigate.mockClear();
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

    it('purges the token and redirect to /login on a 401, then re-throws', () => {
        localStorage.setItem('token', 'my-token');

        const errorSpy = jest.fn();
        http.get('/v1/technologies').subscribe({ error: errorSpy});

        const req = httpMock.expectOne('/v1/technologies');
        req.flush(null, { status: 401, statusText: 'Unauthorized' });

        expect(localStorage.getItem('token')).toBeNull();
        expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
        expect(errorSpy).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
    });

    it('leaves the token and route untouched on a non-401 error', () => {
        localStorage.setItem('token', 'my-token');

        const errorSpy = jest.fn();
        http.get('/v1/technologies').subscribe({ error: errorSpy });

        const req = httpMock.expectOne('/v1/technologies');
        req.flush(null, { status: 500, statusText: 'Internal Server Error' });

        expect(localStorage.getItem('token')).toBe('my-token');
        expect(routerMock.navigate).not.toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalledWith(expect.any(HttpErrorResponse));
    });
});