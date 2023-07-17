import express from "express";

import { user_routes } from "./users";
import { export_routes } from "./exports";

const routes = express.Router();

routes.use("/users", user_routes);
routes.use("/exports", export_routes);

export default routes;
