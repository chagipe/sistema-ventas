# 📦 Sistema de Ventas

![Banner del Proyecto](https://socialify.git.ci/chagipe/sistema-ventas/image?description=Gestión%20de%20Inventario%20y%20Punto%20de%20Venta%20Local&font=Inter&language=1&name=1&owner=1&pattern=Circuit%20Board&theme=Dark)

> Este sistema es una solución robusta y moderna diseñada para la gestión de inventarios y control de ventas, optimizada para funcionar en entornos locales con alta precisión y rapidez.

---

## 🔗 Demo en Vivo

Puedes probar una versión funcional del sistema desplegada en la nube:

* **Enlace:** [https://sistema-ventas-one.vercel.app](https://sistema-ventas-one.vercel.app)
* **Usuario:** `admin@sistema.com`
* **Contraseña:** `password`

---

## 🚀 Tecnologías Utilizadas

Para este proyecto se ha seleccionado un stack moderno que garantiza un rendimiento fluido:

* **Frontend:** ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
* **Estilos:** ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
* **Base de Datos:** ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) ![pgAdmin](https://img.shields.io/badge/pgAdmin-336791?style=for-the-badge&logo=pgadmin&logoColor=white)
* **Lenguajes:** ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

---

## ✨ Características Principales

* ✅ **Dashboard General:** Visualización en tiempo real de métricas de ventas y stock.
* 📦 **Gestión de Inventario:** Control total sobre productos, categorías y proveedores.
* 💰 **Punto de Venta (POS):** Interfaz intuitiva para procesar transacciones rápidamente.
* 📊 **Reportes Localizados:** Generación de datos clave almacenados en tu propia máquina.
* 🔒 **Seguridad de Datos:** Integridad referencial mediante PostgreSQL gestionado en local.

---

## 🛠️ Guía de Instalación Local

Sigue estos pasos para desplegar el proyecto en tu entorno de desarrollo:

### 1. Requisitos Previos
Asegúrate de tener instalado lo siguiente:
* [Node.js](https://nodejs.org/) (Versión 18 o superior)
* [PostgreSQL](https://www.postgresql.org/download/)
* [pgAdmin 4](https://www.pgadmin.org/download/)

### 2. Clonar el Repositorio
```bash
git clone [https://github.com/chagipe/sistema-ventas.git](https://github.com/chagipe/sistema-ventas.git)
cd sistema-ventas
```

### 3. Configuración de la Base de Datos (pgAdmin)
1. Abre **pgAdmin 4** y crea una nueva base de datos llamada `sistema_ventas`.
2. Selecciona la base de datos, haz clic derecho y abre el **Query Tool**.
3. Localiza el archivo de esquema SQL en la carpeta del proyecto (ej: `/database/schema.sql`).
4. Copia el contenido, pégalo en el Query Tool y presiona **F5** para ejecutar y crear las tablas.

### 4. Variables de Entorno
Crea un archivo llamado `.env` en la raíz del proyecto y configura tus credenciales locales:
```env
DB_HOST=localhost
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_de_pgadmin
DB_NAME=sistema_ventas
DB_PORT=5432
```

### 5. Instalación de Dependencias y Ejecución
```bash
# Instalar los paquetes necesarios
npm install

# Iniciar la aplicación en modo desarrollo
npm run dev
```
La aplicación estará disponible en: `http://localhost:5173`

---

## 📐 Estructura del Proyecto

```text
├── src
│   ├── components   # Componentes reutilizables de UI
│   ├── pages        # Vistas principales (Ventas, Inventario, etc.)
│   ├── services     # Lógica de conexión y consultas
│   └── hooks        # Custom hooks para lógica de estado
├── public           # Recursos estáticos
└── database         # Scripts SQL para la creación del esquema
```

---

## 🤝 Contribuciones

Si deseas mejorar este sistema:
1. Haz un **Fork** del proyecto.
2. Crea una rama para tu mejora (`git checkout -b feature/NuevaMejora`).
3. Realiza un **Commit** (`git commit -m 'Añadir nueva funcionalidad'`).
4. Haz **Push** a la rama (`git push origin feature/NuevaMejora`).
5. Abre un **Pull Request**.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---
Desarrollado con ❤️ por [Sebastian Begazo](https://github.com/chagipe)
