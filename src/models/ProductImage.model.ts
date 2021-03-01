import { Table, Column, Model, ForeignKey, PrimaryKey, DataType } from 'sequelize-typescript'
import { User } from './User.model';

@Table({
  tableName: 'product_image',
  timestamps: false
})
export default class ProductImage extends Model {
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column({
    type: DataType.STRING,
    unique: true
  })
  key: string;

  @Column(DataType.INTEGER)
  width: number;

  @Column(DataType.INTEGER)
  height: number;

  @Column(DataType.STRING)
  src: string;

  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  addedBy: number;

  @Column(DataType.DATE)
  createdAt: Date;
}