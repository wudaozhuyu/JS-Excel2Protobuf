let pbjs = require("protobufjs")
let fs = require("fs")
let xlsx = require("xlsx");
var util = require('util');
// const { addListener } = require("process");

let name_reg = new RegExp("^[A-Za-z0-9]+$") // 变量名正则表达式
let type_reg = new RegExp("^[A-Za-z0-9_\\[\\]]+$") // 字段类型正则表达式

let proto_name = "defalut.proto"
let package_name = "package idletank;"
let export_db_folder = "../export_db/"
let export_json_folder = "../export_json/"

let filed_type_list = 
[
    "sint32", "uint32", 
    "sint64", "uint64", 
    "float", "double", 
    "bool", "string"
]

let scheme = 
{
    keyword: "rows", // 数组类型数据行字段固定命名
    packages: [],    // proto 文件内容对象化
    method: "array",
}

let string_list = 
{
    head : [],
    msgs : []
}

function printInfo()
{
    if(arguments)
    {
        let str = ""
        for(let i = 0; i <arguments.length; i++)
            str += arguments[i] + " ";
        
        colorPrint('\x1B[1m%s\x1B[0m', str)
    }
}

function printWarn()
{
    if(arguments)
    {
        let str = ""
        for(let i = 0; i <arguments.length; i++)
            str += arguments[i] + " ";
        
        // colorPrint('\x1B[33m%s\x1B[0m', str)
        colorPrint('\x1B[43m%s\x1B[0m', str)
    }
}

function printError()
{
    if(arguments)
    {
        let str = ""
        for(let i = 0; i <arguments.length; i++)
        {
            str += arguments[i] + " ";
        }
        
        // colorPrint('\x1B[35m%s\x1B[0m', str)
        // colorPrint('\x1B[45m%s\x1B[0m', str)
        // console.log('\x1B[35m%s\x1B[0m', str)
        // console.trace('\x1B[35m%s\x1B[0m', str)
        console.trace('\x1B[41m%s\x1B[0m', str)
    }
}

function colorPrint(color, content)
{
    console.log(color, content)
}

function exportProtoFile(dir)
{
    string_list.head.push('syntax="proto3";')
    string_list.head.push(package_name)

    let paths = fs.readdirSync(dir);
    paths.forEach(function(path)
    {
        if(path.endsWith(".xlsx") && !path.match("~") && !path.match("!"))
        {
            let start_idx = path.indexOf(".xlsx")
            let name = path.substring(0, start_idx)
            if(!readExcel(dir + "/"+ path, name))
                printError(util.format("Read Excel Failed : %s", name))
        }
    });

    let result = writeProtoFile()
    if(!result)
        printError("Write Proto File Failed!")
}
// 验证字段名字
function validFieldName(str)
{
    // if(str.indexOf('_') >= 0)
    // {
    //     printInfo(str, name_reg.test(str))
    // }

    if(name_reg.test(str))
        return str
}

// 验证字段类型
function validFieldType(type_str, onlyNumericType)
{
    if(type_str == undefined || type_str.length <= 0)
        return

    if(!type_reg.test(type_str))
        return

    let prefix = ""
    if(type_str.indexOf("[]") > 0)
    {
        prefix = "repeated "
        type_str = type_str.replace("[]", "")
    }

    if(onlyNumericType)
    {
        let valid_success = false
        for(let i = 0; i < filed_type_list.length; i++)
        {
            if(filed_type_list[i] == type_str)
            {
                valid_success = true
                break
            }
        }
        if(!valid_success)
            return
    }

    if(type_str == "int")
    {
        type_str = "sint32"
        // printError("###########");
    }

    return prefix + type_str 
}

function readMsgSheet(excelName, sheet, sheetName)
{
    let msg = 
    {
        name : "message " + sheetName,
        fields : [],
        level : "child",
        message_name : sheetName
    }

    let msgList = 
    {
        name : "message " + sheetName + "List",
        fields : [],
        level : "parent",
        child_name : sheetName,
        message_name : sheetName + "List"
    }

    msgList.fields.push({ id : 1, type : "repeated " + sheetName, name : scheme.keyword,})

    string_list.msgs.push(msg)
    string_list.msgs.push(msgList)

    // printError("###################")
    // printError(range.s.c, range.e.c)
    // printError(range.s.r, range.e.r)
    let range = xlsx.utils.decode_range(sheet["!ref"]);
    for (let col = range.s.c; col <= range.e.c; col++)
    {
        let id = col + 1 // 索引从1开始
        let name = "" // 字段名字
        let type = "" // 字段类型
        let annotation = "" // 字段注释
        let values = []

        for (let row = range.s.r; row <= range.e.r; row++) 
        {
            let cell = sheet[xlsx.utils.encode_cell({ c: col, r: row })]
            let v = cell && cell.v ? cell.v : ""
            v = v.toString().trim()
            if(v.length <= 0 && row >= 0 && row <= 2)
                break;

            if(row == 0)
            {
                annotation = v
            }
            else if(row == 1)
            {
                type = v
            }
            else if (row == 2)
            {
                name = v
            }
            else
            {
                // printInfo("values.push row", cell && cell.v, v.length, typeof(v))
                values.push(v)
            }
        }   

        if(name.trim().length <= 0 || type.trim().length <= 0)
            return

        if(name && type && annotation)
        {
            let temp = type
            type = validFieldType(type)
            if(!type)
            {
                printError(excelName, sheetName, "Col:", col + 1, "Field Type isn't valid:", temp)
                return; 
            }
            
            temp = name
            name = validFieldName(name)
            if(!name)
            {
                printError(excelName, sheetName, "Col:", col + 1, "Field Name isn't valid:", temp)
                return; 
            }
                
            let c = { id : id, type : type, name : name, annotation : annotation, values : values}
            msg.fields.push(c)
        }
        else
        {
            printError(excelName, sheetName, "Col:", col + 1)
            return
        }
    }
    return true
}

function readEnumSheet(excelName, sheet, sheetName)
{
    let range = xlsx.utils.decode_range(sheet["!ref"]);
    let message = 
    {
        name : "enum " + sheetName,
        fields : [],
        message_name : sheetName
    }
    string_list.msgs.push(message)

    for (let row = range.s.r; row <= range.e.r; row++) 
    {
        let field_type // 字段类型
        let field_value = row // 缺省的时候使用行数作为枚举值
        let field_memo = "" // 字段注释

        for (let col = range.s.c; col <= range.e.c; col++)
        {
            let cell = sheet[xlsx.utils.encode_cell({ c: col, r: row })]
            let v = cell && cell.v ? cell.v : ""
            v = v.toString().trim();
            if(v.length <= 0)
                break;

            if(col == 0)
                field_type = v
            else if(col == 1)
            {
                if(v)
                    field_value = v
            }
            else if (col == 2)
                field_memo = v
        }

        if(field_type)
        {
            let temp = field_type
            field_type = validFieldName(field_type)
            if(field_type)
            {
                let c = { id : field_value, type : field_type, name : "", annotation : field_memo}
                message.fields.push(c)
            }
            else
            {
                printError(excelName, sheetName, "Row:", row + 1, "Field Name isn't valid:", temp)
            }
        }else
        {
            break
        }
    }
}

function readDefineSheet(excelName, sheet, sheetName)
{
    let range = xlsx.utils.decode_range(sheet["!ref"]);
    let message = 
    {
        name : "message " + sheetName,
        fields : [],
        message_name : sheetName
    }
    string_list.msgs.push(message)

    for (let row = range.s.r; row <= range.e.r; row++) 
    {
        let field_type // 字段类型
        let field_name = 0
        let field_memo = "" // 字段注释
        let id = row + 1

        for (let col = range.s.c; col <= range.e.c; col++)
        {
            let cell = sheet[xlsx.utils.encode_cell({ c: col, r: row })]
            let v = cell && cell.v ? cell.v : ""
            v = v.toString().trim();
            if(v.length <= 0)
                break;

            if(col == 0)
                field_type = v
            else if(col == 1)
                field_name = v
            else if (col == 2)
                field_memo = v
        }

        if(field_type)
        {
            let temp0 = field_type
            let temp1 = field_name
            field_type = validFieldType(field_type, true)
            field_name = validFieldName(field_name)
            if(field_type && field_name)
            {
                let c = { id : id, type : field_type, name : field_name, annotation : field_memo}
                message.fields.push(c)
            }
            else
            {
                if(!field_type)
                    printError(excelName, sheetName, "Row:", row + 1, "Field Type isn't valid:", temp0)

                if(!field_name)
                    printError(excelName, sheetName, "Row:", row + 1, "Field Name isn't valid:", temp1)
            }
        }else
        {
            break
        }
    }
}

function readGlobalSheet(excelName, sheet, sheetName)
{
    let msg = 
    {
        name : "message " + sheetName,
        fields : [],
        level : "child",
        message_name : sheetName
    }

    let msgList = 
    {
        name : "message " + sheetName + "List",
        fields : [],
        level : "parent",
        child_name : sheetName,
        message_name : sheetName + "List"
    }

    msgList.fields.push({ id : 1, type : "repeated " + sheetName, name : scheme.keyword,})

    string_list.msgs.push(msg)
    string_list.msgs.push(msgList)

    let range = xlsx.utils.decode_range(sheet["!ref"]);
    for (let row = range.s.r; row <= range.e.r; row++) 
    {
        let field_type // 字段类型
        let field_name = 0
        let field_memo = "" // 字段注释
        let values = []
        let id = row + 1

        for (let col = range.s.c; col <= range.e.c; col++)
        {
            let cell = sheet[xlsx.utils.encode_cell({ c: col, r: row })]
            let v = cell && cell.v ? cell.v : ""
            v = v.toString().trim();
            if(v.length <= 0)
                break;
                
            if(col == 0)
                field_type = v
            else if(col == 1)
                field_name = v
            else if (col == 2)
                values.push(v)
            else if (col == 3)
                field_memo = v
        }

        if(field_type)
        {
            let temp0 = field_type
            let temp1 = field_name

            field_type = validFieldType(field_type, true)
            field_name = validFieldName(field_name)
            if(field_type && field_name)
            {
                let c = { id : id, type : field_type, name : field_name, annotation : field_memo, values : values}
                msg.fields.push(c)
                // printInfo(c)
            }
            else
            {
                if(!field_type)
                    printError(excelName, sheetName, "Row:", row + 1, "Field Type isn't valid:", temp0)

                if(!field_name)
                    printError(excelName, sheetName, "Row:", row + 1, "Field Name isn't valid:", temp1)
            }
        }else
            break;
    }
}

function readExcel(fullPath, excelName)
{
    // printInfo("读取配置表", excelName)

    let result = true
    let workbook = xlsx.readFile(fullPath)
    for (let sheetIndex in workbook.SheetNames)
    {
        let sheetName = workbook.SheetNames[sheetIndex];
        if(sheetName && sheetName.indexOf("!") < 0 && sheetName.length > 0)
        {
            let sheet = workbook.Sheets[sheetName];
            
            // 首字母大小(protobuf 要求)
            sheetName = sheetName.substring(0, 1).toUpperCase() + sheetName.substring(1)
            var isIgnore = sheetName.indexOf('!') >= 0
            if(isIgnore)
                continue;

            var idx = sheetName.indexOf('|')
            if(idx >= 0)
            {
                let str = sheetName.substring(0, idx)
                let name = sheetName.substring(idx + 1, sheetName.length)
                if(str == "E")
                {
                    // printError("E Sheet:", name)
                    readEnumSheet(excelName, sheet, name)
                }
                else if(str == "D")
                {
                    // printError("D Sheet:", name)
                    readDefineSheet(excelName, sheet, name)
                }
                else if(str == "G")
                {
                    // printError("S Sheet:", name)
                    readGlobalSheet(excelName, sheet, name)
                }
                else
                {
                    printError("无法解析的类型 Sheet:", sheetName)
                }
            }
            else
            {
                // printError("Message Sheet:", sheetName)
                readMsgSheet(excelName, sheet, sheetName)
            }
        }
    }
    return result
}

function writeProtoFile()
{
    let text = ""
    for(var i = 0; i < string_list.head.length; i++)
    {
        text += string_list.head[i]
        text += "\n"
    }
    text += "\n"
    for(var i = 0; i < string_list.msgs.length; i++)
    {
        var msg = string_list.msgs[i]
        if(msg)
        {
            text += msg.name + "\n{\n"
            for(var k = 0; k <msg.fields.length; k++)
            {
                var f = msg.fields[k]
                text += "    " + f.type + " " + f.name + " = " + f.id + ";"
                if(f.annotation && f.annotation.length > 0)
                    text += " //" + f.annotation
                text += "\n"
            }
            text += "}\n\n"
        }
    }
    fs.writeFileSync(proto_name, text)
    return true
}

function loadProtoFile(file_name)
{
    let proto = pbjs.loadSync(file_name)
    for (let pb of proto.nestedArray) 
    {
        let package = 
        {
            name: pb.name,
            types: {},
            instances : {}
        }
        scheme.packages.push(package)
        for (let typename in pb) 
        {
            let msgType = pb[typename]
            if (msgType instanceof pbjs.Type) 
            {
                package.types[typename] = msgType
                for (let fieldKey in msgType.fields) 
                {
                    let field = msgType.fields[fieldKey]
                    field.resolve()
                }
            }
        }
    }
}

function createProtoDataObject()
{
    for(var i = 0; i < string_list.msgs.length; i++)
    {
        var msg = string_list.msgs[i]
        if(msg)
        {
            // printInfo("###", msg.name, msg.level)
            // msg.name 是 "message PlayerProps"
            if(msg.name.indexOf("enum") >= 0)
                continue

            let level = msg.level
            if(level != "parent")
                continue

            // printInfo("@", msg.name, msg.child_name, msg.message_name) 
            // printInfo("----------------------------------------")  

            let child_name = msg.child_name
            let message_name = msg.message_name // PlayerProps

            // printError("message_name", message_name)

            let msgtype = undefined
            let package = undefined

            for(let i = 0; i < scheme.packages.length; i++)
            {
                let pkg = scheme.packages[i]
                if(pkg.types[message_name])
                {
                    msgtype = pkg.types[message_name]
                    package = pkg
                }
            }

            if(msgtype == null)
            {
                printError("Isn't Exist MsgType:", message_name, msg.level) 
                continue;
            }

            // let msgType = scheme.packages.types[message_name]
            // printError(msgType, message_name)

            let child_msg = undefined
            for(let k = 0; k < string_list.msgs.length; k++)
            {
                if(string_list.msgs[k].message_name == child_name)
                    child_msg = string_list.msgs[k]
            }

            if(!child_msg)
                continue

            // printInfo("----------------------------------------") 
            // printInfo("#", msg.message_name, msg.child_name, typeof(msgtype)) 

            let instance = msgtype.create();
            package.instances[message_name] = instance
            if (scheme.method == "array")
            {
                let rowObjects = []
                let rowObject = null
                instance[scheme.keyword] = rowObjects
                let rowType = msgtype.fields[scheme.keyword].resolvedType // 数据实际类型

                let rows = 0
                if(child_msg.fields.length > 0)
                    rows = child_msg.fields[0].values.length

                // printInfo("rows", rows, rowType)

                for(var k = 0; k < rows; k++)
                {
                    rowObject = rowType.create()
                    rowObjects.push(rowObject)

                    // printInfo("length", child_msg.fields.length)

                    for(var t = 0; t < child_msg.fields.length; t++)
                    {
                        let field_name = child_msg.fields[t].name
                        let field_type = child_msg.fields[t].type
                        let field_values = child_msg.fields[t].values[k]
                        // set_value(rowObject, field_type, field_name, field_values)
                        // printInfo(rowObject, field_type, field_name, field_values)
                        fillValue(rowObject, field_type, field_name, field_values)
                    }
                    // break
                }
            }
        }
    }
}

function correctValue(field_type, field_value)
{
    let is_string = field_type.indexOf("string") >= 0
    if(is_string)
    {
        return field_value ? field_value.toString() : ""
    }
    else
    {
        if(field_type.indexOf("int") >= 0)
        {
            var parse_value = parseInt(field_value)
            if(field_value && parse_value)
                return parse_value
            else
                return 0
        }else if(field_type.indexOf("float") >= 0 || field_type.indexOf("double") >= 0)
        {
            var parse_value = parseFloat(field_value)
            if(field_value && parse_value)
                return parse_value
            else
                return 0.0
        }else if(field_type.indexOf("bool") >= 0)
        {
            if(typeof(field_value) == "boolean")
            {
                return field_value
            }
            else
            {
                var parse_value = parseInt(field_value)
                if(field_value && parse_value)
                {
                    if(parse_value >= 1)
                        return true
                    else
                        return false
                }
                else
                    return false
            }
        }
        else 
        {
            var parse_value = parseInt(field_value)
            // 判断枚举的情况
            for(let i = 0; i < string_list.msgs.length; i++)
            {
                let msg = string_list.msgs[i]
                if(msg.name.indexOf('enum') >= 0 && msg.message_name == field_type)
                {
                    if(msg.fields.length > 0)
                    {
                        let default_value = parseInt(msg.fields[0].id)
                        if(parse_value)
                        {
                            for(let k = 0; k < msg.fields.length; k++)
                            {
                                if(parseInt(msg.fields[k].id) == parse_value)
                                {
                                    return parse_value
                                }
                            }
                            printError("Enum", field_type, "isn't exist value", parse_value)
                        }
                        else
                        {
                            // 缺省为默认值
                            parse_value = default_value
                        }
                        return default_value
                    }
                    else
                    {
                        printError("Enum", field_type, "Error! Length is zero!")
                    }
                }
            }
        }
        return 0
    }
}

function getMsgTypeByFieldType(field_type)
{
    for(let idx = 0; idx < scheme.packages.length; idx++)
    {
        var pkg = scheme.packages[idx]
        for (let typename of Object.keys(pkg.types)) 
        {
            if(typename == field_type)
            {
                return pkg.types[typename]
            }
        }
    }
}

function fillValue(instance, field_type, field_name, field_value)
{
    let is_repeated = field_type.indexOf("repeated") >= 0
    field_type = field_type.replace("repeated", "").trim()
    let msgType = getMsgTypeByFieldType(field_type)
    let is_customData = msgType != null

    if(is_repeated)
    {
        if(is_customData)
        {
            var arr = field_value.toString().split(",")
            for(let i = 0; i < arr.length; i++)
            {
                let inst = msgType.create()
                let fields = getMessageFields(field_type)
                if(fields)
                {
                    for(var t = 0; t < fields.length; t++)
                    {
                        let ft = fields[t].type
                        let fn = fields[t].name
                        let fv = correctValue(ft, getFieldValueByIndex(arr[i], ft, t, ";"))
                        // printError(ft, fn, fv, inst)
                        fillValue(inst, ft, fn, fv)
                    }
                }
                instance[field_name].push(inst)
            }
        }
        else
        {
            // 非空的字符串
            if(field_value && field_value.length > 0)
            {
                var arr = field_value.toString().split(",")
                for(let i = 0; i < arr.length; i++)
                {
                    let value = arr[i]
                    // printError("value", value, field_type, field_name, instance, field_value.length)
                    instance[field_name].push(correctValue(field_type, value))
                }
            }
        }
    }
    else
    {
        if(is_customData)
        {
            let inst = msgType.create()
            let fields = getMessageFields(field_type)
            if(fields)
            {
                // printInfo("@*#@", field_type, fields.length)

                for(var t = 0; t < fields.length; t++)
                {
                    let ft = fields[t].type
                    let fn = fields[t].name
                    let temp = getFieldValueByIndex(field_value, ft, t, ";")
                    let fv = correctValue(ft, temp)
                    // printInfo(ft, fn, fv, typeof(fv))
                    fillValue(inst, ft, fn, fv)
                }
            }
            instance[field_name] = inst
            // printError(field_type)
        }
        else
        {
            // printInfo(field_type, field_name, field_value, correctValue(field_type, field_value))
            instance[field_name] = correctValue(field_type, field_value)
            // if(field_name == "AT")
            // {
                // printInfo("#########", correct_value(field_type, field_value), field_type, field_value, typeof(field_value))
            // }
            // if(field_name == "iden")
            // {
                // printInfo("#########", correct_value(field_type, field_value), field_type, field_value, typeof(field_value))
                // printInfo(field_name, field_type, typeof(field_type), correctValue(field_type, field_value))
            // }
        }
    }
}

function getFieldValueByIndex(field_values, field_type, idx, split_value)
{
    let value = null
    if(field_values.indexOf(split_value))
    {
        let arr = field_values.split(split_value)
        if(idx >= 0 && idx < arr.length)
            value = arr[idx]
    }
    return value
}

function getMessageFields(message_name)
{
    for(let i = 0; i < string_list.msgs.length; i++)
    {
        let msg = string_list.msgs[i]
        if(msg.message_name == message_name)
        {
            return msg.fields
        }
    }
}

function deleteAllFiles(path)
{
    if(fs.existsSync(path))
    {
        files = fs.readdirSync(path);
        files.forEach((file, index) => {
            let curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory())
            {
                // delDir(curPath); //递归删除文件夹
            }
            else 
            {
                fs.unlinkSync(curPath); //删除文件
            }
        });
        // fs.rmdirSync(path);  // 删除文件夹自身
    }
}

function exportJson()
{
    deleteAllFiles(export_json_folder)

    for(let idx = 0; idx < scheme.packages.length; idx++)
    {
        var pkg = scheme.packages[idx]
        for (let typename of Object.keys(pkg.instances)) 
        {
            // printInfo("json:", typename, pkg.instances[typename]["rows"])
            // for (let sss of Object.keys(pkg.instances[typename]["rows"])) 
            // {
            //     printInfo(sss, "")
            // }

            let inst = pkg.instances[typename]
            fs.writeFileSync(export_json_folder + typename +".json", JSON.stringify(inst))
        }
    }
}

function exportPB()
{
    deleteAllFiles(export_db_folder)

    for(let idx = 0; idx < scheme.packages.length; idx++)
    {
        var pkg = scheme.packages[idx]
        for (let typename of Object.keys(pkg.instances)) 
        {
            let inst = pkg.instances[typename]
            if(inst)
            {
                for (let tn of Object.keys(pkg.types)) 
                {
                    if(tn == typename)
                    {
                        // printInfo("################################################", tn)
                        let tp = pkg.types[tn]
                        let bytes = tp.encode(inst).finish()
                        fs.writeFileSync(export_db_folder + tn +".db", bytes)
                        break
                    }
                }
            }
        }
    }

    // let bytes = scheme.export.encode(scheme.instance).finish()
    //     fs.writeFileSync(outfile, bytes)
}

// foreach_folder(process.cwd())
// foreach_folder(process.execPath)
// foreachExcels()

function getExcelFolder()
{
    let path = __dirname;
    return path.replace("code", "excels")
}

function initProcess()
{
    for (let i = 2; i < process.argv.length; i++) 
    {
        let arg = process.argv[i]
        if(arg.startsWith("proto_name="))
        {
            proto_name = arg.substring("proto_name=".length)
            // printError("proto_name:" + proto_name)
        }else if(arg.startsWith("package_name="))
        {
            package_name = util.format('package %s;', arg.substring("package_name=".length))
            // printError("package_name:", package_name)
        }
        else if(arg.startsWith("export_db_folder="))
        {
            export_db_folder = arg.substring("export_db_folder=".length)
            // printError("package_name:", package_name)
        }
        else if(arg.startsWith("export_json_folder="))
        {
            export_json_folder = arg.substring("export_json_folder=".length)
            // printError("package_name:", package_name)
        }

        
    }
}

function main()
{
    initProcess()

    var path = getExcelFolder();
    let result = exportProtoFile(path)
    if(result == false)
    {
        printError("导出Proto文件失败!")
        return;
    }

    result = loadProtoFile(proto_name)
    if(result == false)
        return

    createProtoDataObject()
    exportJson()
    exportPB()
    printInfo("--- Generate Success! ---")
}

main()