import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting, HttpTestingController} from '@angular/common/http/testing'
import { LogService } from "./log.service";
import { Log } from "./log.model";
import { firstValueFrom } from "rxjs";

describe('LogService', () => {
    let service: LogService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [LogService, provideHttpClientTesting()],
        });
        service = TestBed.inject(LogService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('posts access for a user via POST /v1/logs', async ()=> {
        const userId = 'u1';

        const pending = firstValueFrom(service.logAccess(userId));

        const req = httpMock.expectOne('/v1/logs');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ userId });
        
        req.flush(null);
        const resp = await pending;
        expect(resp).toBeNull();
    });

    it('gets most recent 5 logs via GET /v1/logs', async ()=> {
        const logs: Log[] = [
            { _id: 'l1', userId: 'u1', logDate: '2026-11-10T12:00:00Z' },
            { _id: 'l2', userId: 'u2', logDate: '2026-11-09T08:30:00Z' },
        ];

        const pending = firstValueFrom(service.getRecentLogs(5));

        const req = httpMock.expectOne((r) => r.url === '/v1/logs' && r.method === 'GET');
        expect(req.request.params.get('take')).toBe('5');

        req.flush(logs);
        const resp = await pending;
        expect(resp).toEqual(logs);
    });

    it('defaults to 10 recent logs via GET /v1/logs', async ()=> {
        const logs: Log[] = [
            { _id: 'l1', userId: 'u1', logDate: '2026-11-10T12:00:00Z' },
            { _id: 'l2', userId: 'u2', logDate: '2026-11-09T08:30:00Z' },
        ];

        const pending = firstValueFrom(service.getRecentLogs());

        const req = httpMock.expectOne((r) => r.url === '/v1/logs' && r.method === 'GET');
        expect(req.request.params.get('take')).toBe('10');

        req.flush(logs);
        const resp = await pending;
        expect(resp).toEqual(logs);
    });
});