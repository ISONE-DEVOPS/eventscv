import { GET, POST } from '../app/api/pagali/config/route';

describe('Pagali config API', () => {
    it('should return default config on GET', async () => {
        const res = await GET();
        const json = await res.json();
        expect(json).toHaveProperty('apiKey');
        expect(json).toHaveProperty('secret');
        expect(json).toHaveProperty('environment');
    });

    it('should update config on POST', async () => {
        const payload = { apiKey: 'testKey', secret: 'testSecret', environment: 'sandbox' };
        const mockRequest = {
            json: async () => payload,
        } as any;
        const res = await POST(mockRequest);
        const json = await res.json();
        expect(json).toMatchObject(payload);
    });
});
