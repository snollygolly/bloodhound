# Bloodhound
###Makes TV more awesome.
A hosted version of the software can be found here: [Bloodhound.TV](http://bloodhound.tv)

## Installation
- Make sure the latest version of [node](http://nodejs.org/) is installed
- Install [n](https://www.npmjs.com/package/n)

```
sudo npm install -g n
```
- Switch to the version [koa](http://koajs.com/) needs

```
n 0.11.12
```
- Checkout the code from the repository

```
git clone https://gitlab.com/drevil55/bloodhound.git
```
- Go into that directory and install packages

```
cd bloodhound
npm install
```
- Install [nodemon](https://www.npmjs.com/package/nodemon)

```
sudo npm install -g nodemon
```

- Install [bunyan](https://www.npmjs.com/package/bunyan)

```
sudo npm install -g bunyan
```
- Download and run [CouchDB](http://couchdb.apache.org/)
- Open the CouchDB web admin panel: [Futon](http://127.0.0.1:5984/)
- Create the following databases:
    - ```users```
    - ```index```
    - ```searches```
    - ```shows```
    - ```listings```

- Rename ```config.json.example``` file to ```config.json``` and enter all applicable keys where you see ```XXX```
- Run Bloodhound

```
nodemon --harmony-generators app.js | bunyan
```
- Open [Bloodhound](http://127.0.0.1:3000) and enjoy :)
