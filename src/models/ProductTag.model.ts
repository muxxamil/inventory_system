import { Table, Column, Model, ForeignKey, PrimaryKey, DataType } from 'sequelize-typescript'
import { User } from './User.model';

@Table({
  tableName: 'product_tag',
  timestamps: false
})
export default class ProductTag extends Model {
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.STRING,
    unique: true
  })
  key: string;

  @Column(DataType.STRING)
  name: string;

  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  addedBy: number;

  @Column(DataType.DATE)
  createdAt: Date;
}