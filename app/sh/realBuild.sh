# making Timezone symbolLink
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
rm -rf /tmp/autobit

cd ~/devWorkspace/bitcoinEmailling/app/
mkdir /tmp/autobit

cp -r * /tmp/autobit
cd /tmp/autobit
mv /tmp/autobit/realDockerFile/Dockerfile_real /tmp/autobit/Dockerfile

timestamp=`date +%Y%m%d%H%M`
listenport=8001:8001

# build and Timezon Linking
docker build --tag auto/bitcoin:$timestamp .
docker create --name autobit -p $listenport \
 -v /log/nodejs/:/log/nodejs/ \
 -v /etc/localtime:/etc/localtime:ro \
-e TZ=Asia/Seoul \
auto/bitcoin:$timestamp 

echo 'docker build complete.'




