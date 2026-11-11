import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting, HttpTestingController} from '@angular/common/http/testing'
import { TechnologyService } from "./technology.service";
import { Technology } from "./technology.model";
import { firstValueFrom } from "rxjs";

describe('TechnologyService', () => {
    let service: TechnologyService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TechnologyService, provideHttpClientTesting()],
        });
        service = TestBed.inject(TechnologyService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('fetches all technologies from GET /v1/technologies', async () => {
        const expected: Technology[] = [
            {
            _id: '1',
            name: 'Docker',
            description: 'Containers',
            category: 'Tools',
            ring: 'Adopt',
            ringReason: 'Standard',
            published: true,
            publishedDate: '2026-11-06',
            },
        ];

        const pending = firstValueFrom(service.getTechnologies());

        const req = httpMock.expectOne('/v1/technologies');
        expect(req.request.method).toBe('GET');

        req.flush(expected);
        const resp = await pending;
        expect(resp).toEqual(expected);
    });

    it('creates new technology', async () => {
        const newTechnology: Technology = 
        {
            name: 'Docker',
            description: 'Containers',
            category: 'Tools',
            ring: 'Adopt',
            ringReason: 'Standard',
            published: true,
            publishedDate: '2026-11-06',
        };

        const pending = firstValueFrom(service.createTechnology(newTechnology));

        const req = httpMock.expectOne('/v1/technologies');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newTechnology);

        const created: Technology = { ...newTechnology, _id: '7' };
        req.flush(created);
        const resp = await pending;
        expect(resp).toEqual(created);
    });

    it('updates technology', async () => {
        const updatedTechnology: Technology = 
        {
            _id: '1',
            name: 'Docker',
            description: 'Containers',
            category: 'Tools',
            ring: 'Adopt',
            ringReason: 'Standard',
            published: true,
            publishedDate: '2026-11-06',
        };

        const pending = firstValueFrom(service.updateTechnology(updatedTechnology._id!, updatedTechnology));

        const req = httpMock.expectOne('/v1/technologies/1');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedTechnology);

        req.flush(updatedTechnology);
        const resp = await pending;
        expect(resp).toEqual(updatedTechnology);
    });

    it('deletes technology', async() => {
        const id = '1';

        const pending = firstValueFrom(service.deleteTechnology(id));

        const req = httpMock.expectOne(`/v1/technologies/${id}`);
        expect(req.request.method).toBe('DELETE');

        req.flush(null);
        const resp = await pending;
        expect(resp).toBeNull();
    })
});