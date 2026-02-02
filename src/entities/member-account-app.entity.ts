import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('member_account_app')
export class MemberAccountApp {
  @PrimaryGeneratedColumn()
  account_app_id: number;

  // 회원 일련번호
  @Column({ name: 'mem_id' })
  mem_id: number;

  // 닉네임
  @Column({ name: 'nickname' })
  nickname: string;

  // 로그인 아이디
  @Column({ name: 'login_id' })
  login_id: string;

  // 비밀번호
  @Column({ name: 'password' })
  password: string;

  // 생년월일
  @Column({ name: 'birthday' })
  birthday: string;

  // 상태
  @Column({ name: 'status' })
  status: string;

  // 푸시 알림 동의 여부
  @Column({ nullable: true })
  push_yn: string;

  // 푸시 알림 토큰
  @Column({ nullable: true })
  push_token: string;

  // 최근 접속 날짜
  @Column({ nullable: true })
  recent_dt: string;

  // 활성 날짜
  @Column({ name: 'active_dt', nullable: true })
  active_dt: string;

  // 탈퇴 날짜
  @Column({ nullable: true })
  exit_dt: string;

  // 삭제 여부
  @Column({ nullable: true })
  del_yn: string;

  // 등록 날짜
  @Column({ name: 'reg_dt', nullable: true })
  reg_dt: string;
  
  // 등록 ID
  @Column({ name: 'reg_id', nullable: true })
  reg_id: number;
  
  // 수정 날짜
  @Column({ name: 'mod_dt', nullable: true })
  mod_dt: string;

  // 수정 ID
  @Column({ name: 'mod_id', nullable: true })
  mod_id: number;
} 