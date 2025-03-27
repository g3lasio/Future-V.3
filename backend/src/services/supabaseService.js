const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Inicializar cliente de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_API_KEY;

if (!supabaseUrl || !supabaseKey) {
  logger.error('Faltan las credenciales de Supabase en las variables de entorno');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Servicio para interactuar con la base de datos Supabase
 */
class SupabaseService {
  /**
   * Verifica la conexión con Supabase
   */
  async checkConnection() {
    try {
      const { data, error } = await supabase.from('health_check').select('*').limit(1);
      
      if (error) {
        logger.error(`Error al verificar conexión con Supabase: ${error.message}`);
        return false;
      }
      
      logger.info('Conexión con Supabase establecida correctamente');
      return true;
    } catch (error) {
      logger.error(`Error al verificar conexión con Supabase: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Obtiene el cliente de Supabase
   */
  getClient() {
    return supabase;
  }
  
  /**
   * Crea las tablas necesarias en Supabase si no existen
   */
  async setupDatabase() {
    try {
      // Verificar si las tablas ya existen
      const { data: tables, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (error) {
        logger.error(`Error al verificar tablas existentes: ${error.message}`);
        return false;
      }
      
      const existingTables = tables.map(t => t.table_name);
      
      // Crear tablas si no existen
      // Nota: En Supabase, es mejor crear las tablas desde la interfaz de usuario
      // o usando migraciones SQL, pero aquí mostramos cómo verificar si existen
      
      logger.info(`Tablas existentes en Supabase: ${existingTables.join(', ')}`);
      
      return true;
    } catch (error) {
      logger.error(`Error al configurar la base de datos: ${error.message}`);
      return false;
    }
  }
}

module.exports = new SupabaseService();
