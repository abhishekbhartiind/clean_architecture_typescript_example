import SQLMapper from './sql-mapper';
import { LineItem, UniqueEntityID } from '@entities';
import SqlProductMapper from './sql-product.mapper';

export default class SqlLineItemMapper extends SQLMapper {
  private _productMapper: SqlProductMapper;
  private _connections: any;

  constructor(db: any) {
    const dbName = 'store';
    const modelName = 'line_item';
    super(dbName, modelName, db);
    this._connections = db;
    this._productMapper = new SqlProductMapper(db);
  }

  public toDomain(lineItemRowDTO: any): LineItem {
    const lineItemProps = {
      quantity: lineItemRowDTO.quantity,
      product: this._productMapper.toDomain(lineItemRowDTO.product)
    };

    const uniqueId = new UniqueEntityID(lineItemRowDTO.id);
    return LineItem.build(lineItemProps, uniqueId).value;
  }

  public toPersistence(lineItem: LineItem): any {
    return {
      id: lineItem.id.toValue(),
      product_id: lineItem.product.id.toValue(),
      quantity: lineItem.quantity
    }
  }

    /**
   * @override
   */
  public async find(criteria: any): Promise<LineItem>{
    const t = this._getTransaction();

    let options: any = {
      where: criteria,
      include: [{
        model: this._connections.store.product
      }]
    }

    if (t) {
      options.transactions = t;
    }

    const row = await this._db.findOne(options);
    if(!row) {
      return null;
    }

    return this.toDomain(row);
  };

  public async findAll(conditions: any): Promise<Array<LineItem>> {
    const t = await this._getTransaction();

    let options: any = {
      where: conditions,
      include: [{
        model: this._connections.store.product
      }],
      transaction: t,
      raw: true
    }

    if (t) {
      options.transactions = t;
    }

    const rows = await this._db.findAll(options);

    return rows.map((row: any) => {
      return this.toDomain(row);
    });
  };
}