git clone git@github.com:vaporz/scratch-gui.git

npm config set strict-ssl false

如果已经存在node_modules文件夹，可以先把两个node_modules文件夹都删掉，重新生成，但是一般情况下不删也行:
rm -rf node_modules scratch-vm/src/extensions/scratch3_rocketscience/node_modules

下面的流程没问题，按顺序执行就能成功：
cd stratch-gui
npm install --registry=https://registry.npm.taobao.org

cd scratch-vm/src/extensions/scratch3_rocketscience
npm install --registry=https://registry.npm.taobao.org

cd -
cp -r scratch-vm/* node_modules/scratch-vm

# 在项目第一次build之前打开 export NODE_OPTIONS=--openssl-legacy-provider
npm run build
npm start

等，访问http://localhost:8601/

serve -s build -l tcp://127.0.0.1:8601



errors：
错误：
npm ERR! Cannot read property 'insert' of undefined
解决办法：
1，升级node到指定版本的方法如下:
检查现有版本：node -v
清除npm缓存：npm cache clean -f
安装n模块：sudo npm install -g n
升级到指定版本：sudo n 版本号
验证升级结果：node -v

2，升级npm：
npm -v
升级到最新：sudo npm install -g npm
升级到指定版本：sudo npm -g install npm@10.5.0

错误：
digital envelope routines::unsupported
解决办法：
export NODE_OPTIONS=--openssl-legacy-provider



