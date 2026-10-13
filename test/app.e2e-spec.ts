import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from './../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/auth/zalo?format=json (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/zalo?format=json')
      .expect(200);

    expect(res.body.redirectUrl).toBeDefined();
    const parsed = new URL(res.body.redirectUrl);
    expect(parsed.origin).toBe('https://oauth.zaloapp.com');
    expect(parsed.pathname).toBe('/v4/permission');
    expect(parsed.searchParams.get('app_id')).toBeDefined();
    expect(parsed.searchParams.get('redirect_uri')).toBeDefined();
    expect(parsed.searchParams.get('code_challenge')).toHaveLength(43);
    expect(parsed.searchParams.get('state')).toBeDefined();
  });

  it('/auth/zalo (GET 302 redirect)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/zalo')
      .expect(302);

    expect(res.header.location).toBeDefined();
    expect(res.header.location).toContain('https://oauth.zaloapp.com/v4/permission');
  });

  it('/auth/zalo with code_challenge query parameter does not fail with 400 (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/zalo?format=json&code_challenge=test_challenge')
      .expect(200);

    expect(res.body.redirectUrl).toBeDefined();
    const parsed = new URL(res.body.redirectUrl);
    // Backend tự sinh code_challenge an toàn đúng chuẩn 43 ký tự, không dùng giá trị test_challenge của client
    expect(parsed.searchParams.get('code_challenge')).not.toBe('test_challenge');
    expect(parsed.searchParams.get('code_challenge')).toHaveLength(43);
  });

  it('/auth/zalo with forbidden unknown property still triggers ValidationPipe 400 (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/zalo?format=json&malicious_extra=attack')
      .expect(400);

    expect(res.body.message).toContain('property malicious_extra should not exist');
  });

  it('/auth/zalo/callback with code, state, and code_challenge does not fail with 400 (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/zalo/callback?code=mock_code&state=mock_state&code_challenge=mock_challenge&format=json');

    // Không được trả về lỗi ValidationPipe 400 "property code_challenge should not exist"
    if (res.status === 400) {
      expect(res.body.message).not.toContain('property code_challenge should not exist');
    }
  });

  it('/auth/zalo/callback with unknown property triggers ValidationPipe 400 (GET)', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/zalo/callback?code=mock_code&state=mock_state&forbidden_callback_param=attack')
      .expect(400);

    expect(res.body.message).toContain('property forbidden_callback_param should not exist');
  });

  afterEach(async () => {
    await app.close();
  });
});
