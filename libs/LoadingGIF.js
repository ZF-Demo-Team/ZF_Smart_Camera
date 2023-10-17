
class LoadingGIF {
    gifPath = "./images/ZF_pulse_animation_nb.gif"
    constructor(gifPath="./images/ZF_pulse_animation_nb.gif") {
        // Crear un contenedor para el GIF
        this.domElement = document.createElement("div");
        this.domElement.style.position = 'fixed';
        this.domElement.style.top = '0';
        this.domElement.style.left = '0';
        this.domElement.style.width = '100%';
        this.domElement.style.height = '100%';
        this.domElement.style.background = '#000';
        this.domElement.style.opacity = '0.7';
        this.domElement.style.display = 'flex';
        this.domElement.style.alignItems = 'center';
        this.domElement.style.justifyContent = 'center';
        this.domElement.style.zIndex = '1111';

        // Crear el elemento de imagen para el GIF
        const gif = document.createElement("img");
        gif.src = gifPath;  // Suponiendo que tienes la ruta de tu GIF en la variable gifPath
        gif.alt = "Loading...";
        this.domElement.appendChild(gif);

        // Añadir el contenedor al cuerpo del documento
        document.body.appendChild(this.domElement);
    }

    setGifSize(width=20, height=20) {
        const gifElement = this.domElement.querySelector("img");
        if (gifElement) {
            gifElement.style.width = `${width}px`;
            gifElement.style.height = `${height}px`;
        }
    }

    set visible(value) {
        if (value) {
            this.domElement.style.display = 'flex';
        } else {
            this.domElement.style.display = 'none';
        }
    }

    get loaded() {
        if (this.assets === undefined) return false;

        let ploaded = 0, ptotal = 0;
        Object.values(this.assets).forEach(asset => {
            ploaded += asset.loaded;
            ptotal += asset.total;
        });

        return ploaded == ptotal;
    }

    update(assetName, loaded, total) {
        if (this.assets === undefined) this.assets = {};

        if (this.assets[assetName] === undefined) {
            this.assets[assetName] = { loaded, total };
        } else {
            this.assets[assetName].loaded = loaded;
            this.assets[assetName].total = total;
        }

        let ploaded = 0, ptotal = 0;
        Object.values(this.assets).forEach(asset => {
            ploaded += asset.loaded;
            ptotal += asset.total;
        });

        if (this.loaded) {
            this.visible = false;
        }
    }
}

export { LoadingGIF };
