import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity("channels")
export class Channels {

  @PrimaryGeneratedColumn()
  id: number;//STRING?

  @Column()
  type: string;

  @Column()
  password: string;

  @Column()
  ownerId: number;//STRING?

  @Column()
  createdAt: Date;

  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}

