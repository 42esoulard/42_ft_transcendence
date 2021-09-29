import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity("messages")
export class Messages {

  @PrimaryGeneratedColumn()
  id: number;//STRING?

  @Column()
  channelId: number;//STRING?

  @Column()
  authorId: number;//STRING?

  @Column()
  content: string;

  @Column()
  createdAt: Date;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}

