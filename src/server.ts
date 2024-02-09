import express from "express"
import http from "http"
import path from "path"
import fs from "fs"

export type ServerOptions = {
    port?: number
}

const defaultServerOptions = {
    port: undefined
}

class Server {
    private app: express.Application
    private port: number
    private server?: http.Server

    public constructor({ port }: ServerOptions = defaultServerOptions) {
        this.port = port || 3000
        this.app = express()
    }

    public loadRoutesAndControllers() {
        const routesDir = path.join(__dirname, "routes")
        const controllersDir = path.join(__dirname, "controllers")

        fs.readdirSync(routesDir).forEach((file) => {
            const routePath = path.join(routesDir, file)
            const routeModule = require(routePath)

            if (typeof routeModule === "function") {
                routeModule(this.app)
            }
        })

        fs.readdirSync(controllersDir).forEach((file) => {
            const controllerPath = path.join(controllersDir, file)
            const controllerModule = require(controllerPath)

            if (typeof controllerModule === "function") {
                controllerModule(this.app)
            }
        })
    }

    public start() {
        return new Promise((resolve, reject) => {
            this.server = this.app.listen(this.port, () => resolve(null))
            this.server.on("error", reject)
        })
    }

    public stop() {
        return new Promise((resolve, reject) => {
            if (this.server) {
                this.server.close((error) => {
                    if (error) return reject(error)
                    return resolve(null)
                })
            }
        })
    }
}

export default Server