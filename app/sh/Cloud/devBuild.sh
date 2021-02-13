# making Timezone symbolLink
homepath='/home/UserName'

ln -sf /usr/share/zoneinfo/Asia/Seoul $homepath/etc/localtime
rm -rf $homepath/tmp/bitcoinEmailling

cd $homepath/workspace/devWorkspace/bitcoinEmailling/app/
mkdir $homepath/tmp/bitcoinEmailling

cp -r * $homepath/tmp/bitcoinEmailling
cd $homepath/tmp/bitcoinEmailling

#개발전용 명령어 (only Realmode)
mv $homepath/tmp/bitcoinEmailling/Dockerfiles/Cloud/Dockerfile $homepath/tmp/bitcoinEmailling/Dockerfile
cp $homepath/workspace/devWorkspace/bitcoinEmailling/app/Dockerfiles/Cloud/._env $homepath/workspace/devWorkspace/bitcoinEmailling/app/.env

timestamp=`date +%Y%m%d%H%M`
listenport=18011:18011

# build and Timezon Linking
# -v host경로 docker경로
# -v 경로는 절대경로를 삽입해야함.
docker build --tag auto/maillingdev:$timestamp .
docker create --name maillingdev -p $listenport \
 -v $homepath/log/nodejs/:$homepath/log/nodejs/ \
 -v $homepath/etc/localtime:/etc/localtime:ro \
 -v $homepath/workspace/devWorkspace/bitcoinEmailling/app:$homepath/usr/tmp/nodejs \
-e TZ=Asia/Seoul \
auto/maillingdev:$timestamp 

echo 'docker build complete.'




