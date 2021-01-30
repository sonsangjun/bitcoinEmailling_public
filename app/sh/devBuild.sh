# making Timezone symbolLink
ln -sf /usr/share/zoneinfo/Asia/Seoul /etc/localtime
rm -rf /tmp/autobit

cd ~/devWorkspace/bitcoinEmailling/app/
mkdir /tmp/autobit

cp -r * /tmp/autobit
cd /tmp/autobit

#운영전용 명령어 (only Realmode)
#mv /tmp/autobit/realDockerFile/Dockerfile_real /tmp/autobit/Dockerfile

timestamp=`date +%Y%m%d%H%M`
listenport=18001:18001

# build and Timezon Linking
docker build --tag auto/bitcoindev:$timestamp .
docker create --name autobitdev -p $listenport \
 -v /log/nodejs/:/log/nodejs/ \
 -v /etc/localtime:/etc/localtime:ro \
-e TZ=Asia/Seoul \
auto/bitcoindev:$timestamp 

echo 'docker build complete.'




