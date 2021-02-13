# making Timezone symbolLink
homepath='/home/UserName'

ln -sf /usr/share/zoneinfo/Asia/Seoul $homepath/etc/localtime
rm -rf $homepath/tmp/bitcoinEmailling

cd $homepath/workspace/realWorkspace/bitcoinEmailling/app/
mkdir $homepath/tmp/bitcoinEmailling

cp -r * $homepath/tmp/bitcoinEmailling
cd $homepath/tmp/bitcoinEmailling

#운영전용 명령어 (only Realmode)
mv $homepath/tmp/bitcoinEmailling/Dockerfiles/Cloud/Dockerfile_real $homepath/tmp/bitcoinEmailling/Dockerfile
cp $homepath/workspace/realWorkspace/bitcoinEmailling/app/Dockerfiles/Cloud/._env $homepath/workspace/realWorkspace/bitcoinEmailling/app/.env

timestamp=`date +%Y%m%d%H%M`
listenport=8011:8011

# build and Timezon Linking
# -v host경로 docker경로
# -v 경로는 절대경로를 삽입해야함.
docker build --tag auto/mailling:$timestamp .
docker create --name mailling -p $listenport \
 -v $homepath/log/nodejs/:$homepath/log/nodejs/ \
 -v $homepath/etc/localtime:/etc/localtime:ro \
 -v $homepath/workspace/realWorkspace/bitcoinEmailling/app:$homepath/usr/tmp/nodejs \
-e TZ=Asia/Seoul \
auto/mailling:$timestamp 

echo 'docker build complete.'




