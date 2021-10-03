import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
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

  @Column()
  created_at: number;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}
