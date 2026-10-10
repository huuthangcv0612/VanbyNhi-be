import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { RegisterDto } from './register.dto.js';

describe('RegisterDto', () => {
  function toDto(plain: any): RegisterDto {
    return plainToInstance(RegisterDto, plain);
  }

  it('hợp lệ khi truyền đầy đủ thông tin chuẩn', async () => {
    const dto = toDto({
      fullName: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
      phone: '0901234567',
      password: 'strongPassword123',
      dateOfBirth: '2005-08-10',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.fullName).toBe('Nguyễn Văn A');
    expect(dto.email).toBe('nguyenvana@example.com');
    expect(dto.phone).toBe('0901234567');
  });

  it('tự động trim và lowercase email', async () => {
    const dto = toDto({
      fullName: '  Nguyễn Văn A  ',
      email: '  NguyenVanA@Example.COM  ',
      phone: '  0901234567  ',
      password: 'password123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.fullName).toBe('Nguyễn Văn A');
    expect(dto.email).toBe('nguyenvana@example.com');
    expect(dto.phone).toBe('0901234567');
  });

  it('báo lỗi khi thiếu các trường bắt buộc', async () => {
    const dto = toDto({});

    const errors = await validate(dto);
    const propertiesWithErrors = errors.map((e) => e.property);

    expect(propertiesWithErrors).toContain('fullName');
    expect(propertiesWithErrors).toContain('email');
    expect(propertiesWithErrors).toContain('phone');
    expect(propertiesWithErrors).toContain('password');
  });

  it('báo lỗi khi email sai định dạng', async () => {
    const dto = toDto({
      fullName: 'Nguyễn Văn A',
      email: 'not-an-email',
      phone: '0901234567',
      password: 'password123',
    });

    const errors = await validate(dto);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
    expect(emailError?.constraints?.isEmail).toBe('Email không đúng định dạng');
  });

  it('báo lỗi khi số điện thoại không hợp lệ', async () => {
    const dto = toDto({
      fullName: 'Nguyễn Văn A',
      email: 'test@example.com',
      phone: '123', // ít hơn 9 chữ số
      password: 'password123',
    });

    const errors = await validate(dto);
    const phoneError = errors.find((e) => e.property === 'phone');
    expect(phoneError).toBeDefined();
  });

  it('báo lỗi khi mật khẩu ngắn hơn 6 ký tự', async () => {
    const dto = toDto({
      fullName: 'Nguyễn Văn A',
      email: 'test@example.com',
      phone: '0901234567',
      password: '12345',
    });

    const errors = await validate(dto);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
    expect(passwordError?.constraints?.minLength).toBe(
      'Mật khẩu phải có ít nhất 6 ký tự',
    );
  });

  it('báo lỗi khi dateOfBirth không đúng định dạng ngày', async () => {
    const dto = toDto({
      fullName: 'Nguyễn Văn A',
      email: 'test@example.com',
      phone: '0901234567',
      password: 'password123',
      dateOfBirth: 'invalid-date',
    });

    const errors = await validate(dto);
    const dobError = errors.find((e) => e.property === 'dateOfBirth');
    expect(dobError).toBeDefined();
  });
});
