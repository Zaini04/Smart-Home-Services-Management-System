import express from 'express'
import { getActiveServices, getApprovedProviders } from '../controllers/resident/residentController.js'

const residentRouter =  express.Router()

residentRouter.get('/getWorkers',getApprovedProviders)
residentRouter.get('/getServices',getActiveServices)

export default residentRouter