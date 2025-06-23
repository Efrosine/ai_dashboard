## 🗄️ ORM System

### Definition

The project incorporates a lightweight Object-Relational Mapping (ORM) system to automate database schema management, migrations, and seeding. Built using Node.js and `mysql2/promise`, it provides a modular structure for managing the MySQL database, replacing manual SQL execution with CLI-driven workflows.

### Key Components:

- **Models**: Define table schemas and seed data (e.g., `ScrapedData.js` for `scraped_data` table).
- **Migrator**: Handles table creation (`CREATE TABLE`) and optional dropping (`DROP TABLE`).
- **Seeder**: Populates tables with initial data.
- **Database Connection**: Managed via `db.js` using a MySQL connection pool.
- **CLI Scripts**: `npm run migrate`, `npm run migrate:flush`, `npm run seed`.

### Purpose:

- Automate table creation based on the ERD.
- Support schema updates with a flush-and-recreate option.
- Enable rapid setup with seed data for testing and development.
- Maintain a lightweight, dependency-free approach compared to heavy ORMs like Sequelize.

### Additional

**Model Example**: Each table in the ERD has a corresponding model file. For instance, `ScrapedData.js`:

```javascript
module.exports = {
  name: "scraped_data",
  schema: `
    id INT AUTO_INCREMENT PRIMARY KEY,
    input_query VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  `,
  seed: [{ input_query: "test_query_1" }, { input_query: "test_query_2" }],
};
```

**Extensibility**: The ORM supports future enhancements, such as schema versioning, validation, or query builders, without requiring additional dependencies.

**Integration Points**:

- The frontend’s `api.js` uses the ORM’s database connection (`db.js`) for queries, ensuring consistent data access.
- The `docker-compose.yml` includes a server service to run the ORM, alongside the frontend and MySQL containers.

**Benefits for Development**:

- Simplifies database setup during development and testing.
- Ensures schema consistency between code and database.
- Reduces manual SQL maintenance, aligning with the project’s modular philosophy.

### Implementation Details

**File Structure**:

- `/server/models/`: Contains model files for each table (`ScrapedData.js`, `CCTV.js`, etc.).
- `/server/orm/`: Includes `migrator.js` for migrations and `seeder.js` for seeding.
- `/server/db.js`: Configures the MySQL connection pool.
- `/server/migrate.js` and `seed.js`: CLI entry points for migrations and seeding.

**Workflow**:

- Run `npm run migrate` to create tables during setup.
- Use `npm run migrate:flush` to update schemas during development.
- Execute `npm run seed` to populate initial data (e.g., dummy accounts, locations).

**Docker Integration**: The server service in `docker-compose.yml` runs the ORM, with dependencies on the MySQL container.

**Package.json Scripts**:

```json
"scripts": {
  "migrate": "node server/migrate.js",
  "migrate:flush": "node server/migrate.js --flush",
  "seed": "node server/seed.js"
}
```
