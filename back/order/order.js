const express = require('express');
const router = express.Router();
const connection = require('../db');
require('dotenv').config();
const jwt = require('jsonwebtoken');