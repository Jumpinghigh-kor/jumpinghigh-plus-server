import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class AuthDto {
  @IsString()
  login_id: string;

  @IsString({ message: '비밀번호는 문자 형식이어야 합니다.' })
  // @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  // @Matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  //   { message: '비밀번호는 영어 대문자, 소문자, 숫자,\n특수문자를 모두 포함해야 합니다.' }
  // )
  password: string;
} 