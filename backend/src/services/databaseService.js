const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Servicio para la conexión y gestión de la base de datos
 */
class DatabaseService {
  /**
   * Conecta a la base de datos MongoDB
   */
  async connect() {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      logger.info(`MongoDB conectado: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      logger.error(`Error al conectar a MongoDB: ${error.message}`);
      process.exit(1);
    }
  }
  
  /**
   * Cierra la conexión a la base de datos
   */
  async disconnect() {
    try {
      await mongoose.disconnect();
      logger.info('Conexión a MongoDB cerrada');
    } catch (error) {
      logger.error(`Error al cerrar la conexión a MongoDB: ${error.message}`);
    }
  }
  
  /**
   * Verifica el estado de la conexión a la base de datos
   */
  checkConnection() {
    return {
      state: mongoose.connection.readyState,
      status: this.getConnectionStatus(mongoose.connection.readyState),
      host: mongoose.connection.host,
      name: mongoose.connection.name
    };
  }
  
  /**
   * Obtiene el estado de la conexión en formato legible
   * @private
   */
  getConnectionStatus(state) {
    const states = {
      0: 'Desconectado',
      1: 'Conectado',
      2: 'Conectando',
      3: 'Desconectando'
    };
    
    return states[state] || 'Desconocido';
  }
}

module.exports = new DatabaseService();
