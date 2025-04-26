import { GET } from './route';

describe('/api/sounds', () => {
  it('should return a 200 OK response with correct data structure', async () => {
    const mockRequest = new Request('http://localhost:3000/api/sounds');

    const response = await GET(mockRequest);
    
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('sounds');
    expect(data).toHaveProperty('totalSounds');
    expect(data).toHaveProperty('currentPage');
    expect(data).toHaveProperty('totalPages');
    expect(Array.isArray(data.sounds)).toBe(true);
    expect(typeof data.totalSounds).toBe('number');
    expect(typeof data.currentPage).toBe('number');
    expect(typeof data.totalPages).toBe('number');
  });
});