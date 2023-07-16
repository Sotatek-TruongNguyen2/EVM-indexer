import express from "express";

import { user_routes } from "./users";

const routes = express.Router();

routes.use("/users", user_routes);

export default routes;
