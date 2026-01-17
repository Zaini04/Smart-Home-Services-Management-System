import express from 'express'
import { getAllServices, getApprovedProviders } from '../controllers/residentController.js'

const residentRouter =  express.Router()

residentRouter.get('/getWorkers',getApprovedProviders)
residentRouter.get('/getServices',getAllServices)

export default residentRouter