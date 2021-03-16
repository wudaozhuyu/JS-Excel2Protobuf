# JS-Excel2Protobuf
描述：通过excel导出proto文件&&生成数据

步骤:
1. 安装nodejs环境 -> vs打开工程 -> ctrl+~ -> npm i
2. 运行"一键生成.bat"

配置文件:config.ini
    proto_name ：proto导出路径
    package_name : 包名
    export_db_folder : 导出db路径
    export_json_folder ： 导出json路径

文件描述
    export_db:导出的db数据文件
    export_json:导出的json数据文件
    protoc_out/game_config.proto:导出的proto文件
    protoc_out/game_config.pb:通过proto导出的二进制文件
    protoc_out/cpp: 通过proto生成对应语言的文件
    protoc_out/charp: 通过proto生成对应语言的文件
    protoc_out/java: 通过proto生成对应语言的文件
    protoc_out/java: 通过proto生成对应语言的文件

配置规则
    查看 excels/cfg_player.xlsx 里面的页签"!备注"

环境: Unity xlua lua-protobuf
测试: 加载game_config.pb文件，加载TotalDataList.db文件
伪代码:
    local pb = require "pb"
    local serpent = require("net.serpent")

    //加载game_config.pb文件
    local path = "Assets/Data/game_config.pb"
    local uasset = ResourceManager.LoadAsset(path)
    local bytes = uasset:ReadAllBytes()
    pb.load(bytes)

    //加载TotalDataList.db文件
    local path = "Assets/Data/Config_DB/TotalDataList.db"
    local uasset = ResourceManager.LoadAsset(path)
    local bytes = uasset:ReadAllBytes()
    local msg = pb.decode("idleafk.TotalDataList", bytes)
    print(serpent.block(msg)) -- 打印结果

打印结果:
    LUA: {
  rows = {
    {
      courses = {
        "语文",
        "数学",
        "历史",
        "物理"
      } --[[table: 000000013BA6F740]],
      dressCost = {
        isPayed = false,
        itemCount = 100,
        itemId = "人明币"
      } --[[table: 000000013BA6F6C0]],
      drink = {
        {
          isPayed = true,
          itemCount = 3,
          itemId = "绿茶"
        } --[[table: 000000013BA6F940]],
        {
          isPayed = true,
          itemCount = 5,
          itemId = "营养快线"
        } --[[table: 000000013BA6F7C0]]
      } --[[table: 000000013BA6F700]],
      iden = "Forwad",
      name = "张三"
    } --[[table: 000000013BA6F980]]
  } --[[table: 000000013BA6F8C0]]
} --[[table: 000000013BA6EE80]]
