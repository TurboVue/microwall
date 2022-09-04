```shell
brew tap mongodb/brew
brew update
brew install mongodb-community@5.0
brew install mongosh
brew install mongodb-database-tools

export PATH=$PATH:/usr/local/opt/mongodb-community@5.0/bin

```
```shell
use admin
db.createUser({ user: "mongo", pwd: "mongo", roles: ["root"]})
```
```shell
vi /usr/local/etc/mongod.conf

```
```yaml
security:
  authorization: enabled
```
```shell
brew services restart mongodb/brew/mongodb-community@5.0
```
```shell
mongo --port 27017 -u "mongo" -p "mongo" --authenticationDatabase "mongo"
```
[reference](https://blog.tericcabrel.com/enable-authentication-and-authorization-on-mongodb/)