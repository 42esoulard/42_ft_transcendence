import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity('messages')
export class Messages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel_id: number;

  @Column()
  author_id: number;

  @Column()
  content: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'now()' })
  created_at: Date;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
