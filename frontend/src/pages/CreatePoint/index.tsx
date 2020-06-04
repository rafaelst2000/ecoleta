import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet'
import api from '../../services/api'
import axios from 'axios'

import './styles.css'

import logo from '../../assets/logo.svg'

interface Item{
  id: number;
  title: string;
  imgUrl: string;
} //Model

interface IBGEUFResponse{
  sigla: string;
}

interface IBGECityResponse{
  nome: string
}

const CreatePoint = () => {
  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [initialPos, setInitialPos] = useState<[number,number]>([0,0])
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0])

  const history = useHistory()

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(pos => {
      const {latitude, longitude} = pos.coords

      setInitialPos([latitude, longitude])
    })
  }, [] )

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data)
    })
  }, [])

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
      const ufInitials = res.data.map(uf => uf.sigla)
      setUfs(ufInitials)
    })
  }, [])

  useEffect(() => {
    if(selectedUf === '0'){
      return
    }

    axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
          .then(res => {
            const cityNames = res.data.map(city => city.nome )
            setCities(cityNames)
    })

  }, [selectedUf])

  function handleSelectUF (event: ChangeEvent<HTMLSelectElement>){
    setSelectedUf(event.target.value)
  }

  function handleSelectCity (event: ChangeEvent<HTMLSelectElement>){
    setSelectedCity(event.target.value)
  }

  function handleMapClick (event: LeafletMouseEvent){
    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>){
    const { name, value } = event.target
    setFormData({ ...formData,[name]: value })
  }

  function handleSelectItem(id: number){
    const alredySelected = selectedItems.findIndex(item => item === id)

    if(alredySelected >=0){
      const filteredItens = selectedItems.filter(item => item !== id)
      setSelectedItems(filteredItens)
    }else{
      setSelectedItems([...selectedItems, id])
    }
    
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault()

    const { name, email, whatsapp } = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems

    const data = {
      name, email, whatsapp, uf, city, latitude, longitude, items
    }

   await api.post('points', data)

   alert("Ponto de coleta criado")

   history.push('/')
  }

  return(
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Logo" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input onChange={handleInputChange} type="text" name="name" id="name"/>
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input onChange={handleInputChange} type="email" name="email" id="email"/>
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input onChange={handleInputChange} type="text" name="whatsapp" id="whatsapp"/>
            </div>
          </div>  
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPos} zoom={15} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <Marker position={selectedPosition} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select onChange={handleSelectUF} value={selectedUf} name="uf" id="uf">
                <option value="0">Selecione uma UF</option>

                {ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                ))}
               
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select onChange={handleSelectCity} name="city" id="city">
                <option value="0">Selecione uma Cidade</option>

                {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de Coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items.map(item => (
            <li key={item.id} className={selectedItems.includes(item.id)? 'selected' :''}
                onClick={() => handleSelectItem(item.id)}>
              <img src={item.imgUrl} alt={item.title} />
              <span>{item.title}</span>
            </li>
            ))}
            
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  )
}

export default CreatePoint