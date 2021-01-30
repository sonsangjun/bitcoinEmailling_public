# making Timezone symbolLink
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
rm -rf /tmp/bitcoinEmailling

cd ~/devWorkspace/bitcoinEmailling/app/
mkdir /tmp/bitcoinEmailling

cp -r * /tmp/bitcoinEmailling
cd /tmp/bitcoinEmailling
mv /tmp/bitcoinEmailling/realDockerFile/Dockerfile_real /tmp/bitcoinEmailling/Dockerfile

timestamp=`date +%Y%m%d%H%M`
listenport=8011:8011

# build and Timezon Linking
docker build --tag auto/errmail:$timestamp .
docker create --name errmail -p $listenport \
 -v /log/nodejs/:/log/nodejs/ \
 -v /etc/localtime:/etc/localtime:ro \
-e TZ=Asia/Seoul \
auto/errmail:$timestamp 

echo 'docker build complete.'




