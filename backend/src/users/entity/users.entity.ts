import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, CreateDateColumn } from 'typeorm';
// import * as bcrypt from 'bcrypt';

@Entity("users")
export class Users {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 50 })
  username: string;
  
  @Column({ type: "varchar", length: 255 })
  password: string;
  
  @Column({ type: "varchar", length: 255 })
  salt: string;
  
  @Column({ type: "varchar", length: 255 })
  avatar: string;
 
  @Column({ type: "boolean", default: false })
  two_fa: boolean;
  
  @CreateDateColumn({ type: "timestamp", default: () => "now()" })
  created_at: Date;
 
  // @BeforeInsert()
  // async hashPassword() {
  //   this.salt = await bcrypt.genSalt();
  //   this.password = await bcrypt.hash(this.password, this.salt);
  // }
}

