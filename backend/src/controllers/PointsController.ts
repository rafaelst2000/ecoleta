import { Request, Response} from 'express'
import knex from '../database/connection'

class PointsController{

  async index(req: Request, res: Response){
    const { city, uf, items } = req.body
    
    const parsedItems = String(items)
    .split(',')
    .map(item => Number(item.trim()))

    const points = await knex('points')
      .join('points_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*')

    return res.json(points)
  }

  async show(req: Request, res: Response){
    const { id } = req.params
    const point = await knex('points').where('id',id).first()

    if(!point){
      return res.status(400).json({ message: 'Point not found.'})
    }

    const items = await knex('items')
      .join('points_items', 'items.id' , '=' , 'point_items.item_id')
      .where('point_items.point_id', id)
      .select('items.title')

    return res.json({ point, items })
  }

  async create(req: Request, res: Response){
    const {
      name,email, whatsapp, latitude, longitude, city, uf, items
    } = req.body
  
    const trx = await knex.transaction()

    const point = {
      image: 'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=600&q=40',
      name,email, whatsapp, latitude, longitude, city, uf
    }
  
    const insertedIds = await trx('points').insert(point)
  
    const point_id = insertedIds[0]
  
    const point_items = items.map((item_id: number) => {
      return {
        item_id,
        point_id,
      }
    })
  
    await trx('point_items').insert(point_items)

    await trx.commit()
  
    return res.json({ 
      id: point_id,
      ...point,
     })
  }
}

export default PointsController