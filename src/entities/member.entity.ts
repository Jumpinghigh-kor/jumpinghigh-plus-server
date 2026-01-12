import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn()
  mem_id: number;

  // 이름
  @Column({ name: 'mem_name' })
  mem_name: string;

  // 전화번호
  @Column({ name: 'mem_phone' })
  mem_phone: string;

  // 생년월일
  @Column({ name: 'mem_birth' })
  mem_birth: string;

  // 가입일
  @Column({ name: 'mem_regist_date' })
  mem_regist_date: string;

  // 성별
  @Column({ name: 'mem_gender' })
  mem_gender: string;

  // 사물함
  @Column({ name: 'mem_locker' })
  mem_locker: string;

  // 사물함 번호
  @Column({ name: 'mem_locker_number' })
  mem_locker_number: string;

  // 출입 번호
  @Column({ name: 'mem_checkin_number' })
  mem_checkin_number: string;

  // 매니저명
  @Column({ name: 'mem_manager' })
  mem_manager: string;

  // 시간표 일련번호
  @Column({ name: 'mem_sch_id' })
  mem_sch_id: number;

  // 메모
  @Column({ name: 'mem_memo' })
  mem_memo: string;
  
  // 회원상태
  @Column({ name: 'mem_status' })
  mem_status: number;

  // 센터 아이디
  @Column({ name: 'center_id' })
  center_id: string;
} 