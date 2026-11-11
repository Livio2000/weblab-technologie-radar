import { TestBed } from "@angular/core/testing";
import { provideHttpClientTesting, HttpTestingController} from '@angular/common/http/testing'
import { UserService } from "./user.service";
import { User } from "./user.model";
import { firstValueFrom } from "rxjs";

describe('UserService', () => {
    let service: UserService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [UserService, provideHttpClientTesting()],
        });
        service = TestBed.inject(UserService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('fetches all users from GET /v1/users', async () => {
        const expected: User[] = [
            {
                _id: '1',
                firstName: 'Test',
                lastName: 'User',
                email: 'test.user@example.com',
                role: 'Administrator'
            },
        ];

        const pending = firstValueFrom(service.getUsers());

        const req = httpMock.expectOne('/v1/users');
        expect(req.request.method).toBe('GET');

        req.flush(expected);
        const resp = await pending;
        expect(resp).toEqual(expected);
    });

    it('creates new user via POST /v1/users', async () => {
        const newUser: User = 
        {
            firstName: 'Test',
            lastName: 'User',
            email: 'test.user@example.com',
            role: 'Administrator'
        };

        const pending = firstValueFrom(service.createUser(newUser));

        const req = httpMock.expectOne('/v1/users');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newUser);

        const created: User = { ...newUser, _id: '7' };
        req.flush(created);
        const resp = await pending;
        expect(resp).toEqual(created);
    });

    it('updates user via PUT /v1/users', async () => {
        const updatedUser: User = 
        {
            _id: '1',
            firstName: 'Test',
            lastName: 'User',
            email: 'test.user@example.com',
            role: 'Administrator'
        };

        const pending = firstValueFrom(service.updateUser(updatedUser._id!, updatedUser));

        const req = httpMock.expectOne('/v1/users/1');
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updatedUser);

        req.flush(updatedUser);
        const resp = await pending;
        expect(resp).toEqual(updatedUser);
    });

    it('deletes user via DELETE /v1/users', async() => {
        const id = '1';

        const pending = firstValueFrom(service.deleteUser(id));

        const req = httpMock.expectOne(`/v1/users/${id}`);
        expect(req.request.method).toBe('DELETE');

        req.flush(null);
        const resp = await pending;
        expect(resp).toBeNull();
    })
});