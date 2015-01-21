# Bloodhound
###Makes TV more awesome.
A hosted version of the software can be found here: [Bloodhound.TV](http://bloodhound.tv)

## Installation
- Make sure the latest version of [node](http://nodejs.org/) is installed
- Install [n](https://www.npmjs.com/package/n)
- Make sure to install and have [Redis](http://redis.io/) running.
- Make sure to install and have [CouchDB](http://couchdb.apache.org/) running.

```
sudo npm install -g n
```
- Switch to the version [koa](http://koajs.com/) needs

```
n 0.11
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
- Rename ```config.json.example``` file to ```config.json``` and enter all applicable keys where you see ```XXX```
- Run Bloodhound

```
npm start
```
- Open [Bloodhound](http://127.0.0.1:3000) and enjoy :)
