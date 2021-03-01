import { Table, Column, Model, ForeignKey, PrimaryKey, DataType } from 'sequelize-typescript'
import { User } from './User.model';
import Product from './Product.model';
import ProductTag from './ProductTag.model';

@Table({
  tableName: 'product_tag_mapping',
  timestamps: false
})
export default class ProductTagMapping extends Model {
  @PrimaryKey
  @Column(DataType.INTEGER)
  id: number;

  @Column(DataType.INTEGER)
  @ForeignKey(() => Product)
  productId: number;

  @Column(DataType.INTEGER)
  @ForeignKey(() => ProductTag)
  tagId: number;

  @Column(DataType.INTEGER)
  @ForeignKey(() => User)
  addedBy: number;

  @Column(DataType.DATE)
  createdAt: Date;
}