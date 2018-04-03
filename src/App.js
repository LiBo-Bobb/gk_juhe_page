import React, {Component} from 'react';
import 'weui';
import 'react-weui/build/packages/react-weui.css';
import request from 'superagent'
import {
    LoadMore,
    ActionSheet,
    Toast,
} from 'react-weui';
import './App.css';
import {Helmet} from "react-helmet";


const imgSite = "http://img.gankao.com/"
const courseSite = "http://www.gankao.com/course/"
export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //课程数据
            list: [],
            //课程数据备份
            list2: [],
            //筛选纬度数组
            scopeList: [],
            //聚合页信息
            special: {},
            //默认年级Actionsheet隐藏
            gradeShow: false,
            //默认科目Actionsheet隐藏
            subjectShow: false,
            //默认版本Actionsheet隐藏
            versionShow: false,
            //年级菜单
            gradeMenues: [],
            //科目菜单
            subjectMenus: [],
            //版本菜单
            versionMenus: [],
            //年级菜单的取消按钮
            gradeActions: [
                {
                    label: '取消',
                    onClick: this.hideSubject.bind(this)
                }
            ],
            //科目菜单的取消按钮
            subjectActions: [
                {
                    label: '取消',
                    onClick: this.hideSubject.bind(this)
                }
            ],
            //版本菜单的取消按钮
            versionActions: [
                {
                    label: '取消',
                    onClick: this.hideSubject.bind(this)
                }
            ],
            //当前年级
            currentGrade: "全部",
            //当前科目
            currentSubject: "全部",
            //当前版本
            currentVersion: "全部",
            activedIndex: 1000,
            //顶部图片
            top_img: "",
            //聚合页标题
            pageTitle: "",
            //聚合页描述
            pageDescription: "",
            //seo key
            pageKeywords: ""

        }
    };

    hideSubject() {
        this.setState({
            subjectShow: false,
            gradeShow: false,
            versionShow: false,
        });
    }


    componentDidMount() {
        let code = this.params("code", -1)
        //三个纬度
        this.getSpecialPage("test6")
        //两个纬度 年级  科目
        // this.getSpecialPage(1001)
        //两个纬度 年级 版
        // this.getSpecialPage(333)
        //单个纬度  年级
        // this.getSpecialPage(1212)
        //单个纬度 科目
        // this.getSpecialPage(212)
        // this.getSpecialPage("00")
        // console.log("url......")
        // console.log(window.location.href)
        // console.log(window.location.host)

        // this.getSpecialByGrade(9)
    }

    //初始调用课程数据接口，进行数据本地本地保存
    getSpecialPage = (link) => {
        this.setState({isLoading: true})
        let {list} = this.state;
        //复制一份课程数据
        let list2 = [...list]
        //获取当前年级
        let grade = this.params("grade", -1)
        console.log("当前年级.....")
        console.log(grade)
        console.log("复制的课程完整数据....")
        console.log(list2)
        request
            .post('http://lubo.api_test.gankao.com/gktag/getSpecialPage')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                link,
            })
            .end(
                (err, res) => {
                    console.log("获取聚合页总信息.....")
                    console.log(res.body)
                    if (err === null) {
                        let {err, result: {list, scopeList, special}} = res.body
                        let scopeIndexArr = ['年级', '科目', '版本'];
                        scopeList = scopeList.sort((item1, item2) => {
                            console.log("item1", item1)
                            console.log("item2", item2)
                            // 年级1>0科目  索引小的排在索引大的前面
                            return scopeIndexArr.indexOf(item1.name) - scopeIndexArr.indexOf(item2.name)
                        });
                        console.log('sorted scopeLIst', scopeList)
                        let a = [...list]
                        let InitState={
                            list,
                            list2: list,
                            scopeList,
                            special,
                            isLoading: false,
                            //顶部图片
                            top_img: special.banner,
                            //页面标题
                            pageTitle: special.title,
                            //页面描述
                            pageDescription: special.description,
                            //页面关键字
                            pageKeywords: special.keyword,
                        }

                        //默认有年级的时候，选中年级并且筛选处理

                        if (scopeList[0] && scopeList[0].name === "年级") {
                            let gradeIndex;
                            let currentGraded = [
                                {id: 1, name: "一年级"},
                                {id: 2, name: "二年级"},
                                {id: 3, name: "三年级"},
                                {id: 4, name: "四年级"},
                                {id: 5, name: "五年级"},
                                {id: 6, name: "六年级"},
                                {id: 7, name: "七年级"},
                                {id: 8, name: "八年级"},
                                {id: 9, name: "九年级"},
                                {id: 10, name: "高一"},
                                {id: 11, name: "高二"},
                                {id: 12, name: "高三"}]
                            for (let i of currentGraded) {
                                if (grade == i.id) {
                                    a = a.filter(item => item.course.grade.name === i.name)
                                    gradeIndex = scopeList[0].list.findIndex(gradeItem => gradeItem === i.name)
                                    InitState = {...InitState, currentGrade: i.name, list2: a, activedIndex: gradeIndex}
                                    break;
                                }
                            }

                        }
                        this.setState(InitState);
                    }
                }
            )
    }

    getSpecialByGrade = (gradeId, pageNo = 1, pageSize = 10) => {
        request
            .post('http://lubo.api_test.gankao.com/gktag/getSpecialByGrade')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send({
                gradeId,
                pageNo,
                pageSize
            })
            .end(
                (err, res) => {
                    console.log("根据年级拉取聚合专题.....")
                    console.log(res.body)

                }
            )
    }
    //点击
    handleClick = (scopeValue, scopeKey) => {//1.当前选中的item；2."currentGrade"
        let {currentVersion, currentSubject, currentGrade, list} = this.state
        //已经选择的筛选纬度
        let selectedScopes = {currentVersion, currentGrade, currentSubject}
        console.log("selectedScopes......")
        console.log(selectedScopes)
        //当前选择的项和值进行赋值
        selectedScopes[scopeKey] = scopeValue;
        console.log(selectedScopes)
        let list2 = [...list];
        console.log("list2......")
        console.log(list2)
        console.log("Object.keys......")
        console.log(Object.keys(selectedScopes))
        for (let key of Object.keys(selectedScopes)) {
            // console.log("key......")
            // console.log(key)
            if (key === "currentGrade" && !selectedScopes[key].includes('全')) {
                list2 = list2.filter(itemLesson => itemLesson.course.grade.name === selectedScopes[key])
            } else if (key === "currentSubject" && !selectedScopes[key].includes('全')) {
                list2 = list2.filter(itemLesson => itemLesson.course.subject.name === selectedScopes[key])
            } else if (key === "currentVersion" && !selectedScopes[key].includes('全')) {
                if (selectedScopes[key] === "其他") {
                    list2 = list2.filter(itemLesson => itemLesson.course.tongbu === null)
                } else {
                    list2 = list2.filter(itemLesson => itemLesson.course.tongbu === selectedScopes[key])
                }
            }
        }
        // console.log("................................................")
        // console.log({
        //     list,
        //     versionShow: false,
        //     gradeShow: false,
        //     subjectShow: false,
        //     list2,
        //     [scopeKey]: scopeValue
        // })
        this.setState({
            versionShow: false,
            gradeShow: false,
            subjectShow: false,
            list2,
            //学习点
            [scopeKey]: scopeValue,
        })
    };
    //处理选中action
    handleAction = (item) => {
        let {scopeList} = this.state
        console.log("scopeList......")
        console.log(scopeList);
        let keyValueCopes = [
            {name: "年级", key: "gradeMenues", currentName: "currentGrade"},
            {name: "科目", key: "subjectMenus", currentName: "currentSubject"},
            {name: "版本", key: "versionMenus", currentName: "currentVersion"}
        ];
        let keyValueCope = keyValueCopes.find(i => i.name === item.name);
        console.log("点的当前actionSheet......")
        console.log(keyValueCope)
        let subjectsFor = scopeList[scopeList.findIndex(_item => _item.name === item.name)].list.map(item2 => ({
            label: item2,
            onClick: () => {
                this.handleClick(item2, keyValueCope.currentName);
            }
        }));
        subjectsFor.unshift({
            label: "[全部]",
            onClick: () => {
                switch (item.name) {
                    case "年级":
                        this.setState({currentGrade: "全部", gradeShow: false})
                        this.handleClick("全部", "currentGrade")
                        break;
                    case "科目":
                        this.setState({currentSubject: "全部", subjectShow: false})
                        this.handleClick("全部", "currentSubject")
                        break;
                    default:
                        this.setState({currentVersion: "全部", versionShow: false})
                        this.handleClick("全部", "currentVersion")
                }
            }
        })
        this.setState({
            [keyValueCope['key']]: subjectsFor
        });
    };
    //一个纬度的时候进行筛选处理
    handleNavSingle = (item, navType, index) => {
        let grade = this.params("grade", -1)
        let {list} = this.state
        let list2 = [...list]
        list2 = list2.filter((courseItem) => {
            if (navType === "年级") {
                return courseItem.course.grade.name === item
            } else if (navType === "科目") {
                return courseItem.course.subject.name === item
            } else {
                if (item === "其他") {
                    return courseItem.course.tongbu === null
                } else {
                    return courseItem.course.tongbu === item
                }
            }
        })
        this.setState({list2, activedIndex: index})
    }
    params = (key, defaultvalue) => {
        window._params = {};
        let url = document.location.href;
        if (document.location.href.indexOf("#") !== -1) {
            url = document.location.href.split("#").shift();
        }
        let query = url.split("?");
        if (query.length > 1) {
            query = query[1];
            let paramItems = query.split("&");
            for (let i = 0; i < paramItems.length; i++) {
                let item = paramItems[i].split("=");
                window._params[item[0]] = item[1];
            }
        }
        if (key) {
            return window._params[key] || defaultvalue;
        } else {
            return window._params
        }
    }

    render() {
        let {list2, isLoading, scopeList, top_img, pageTitle, pageDescription, pageKeywords, currentGrade, currentSubject, currentVersion, gradeShow, subjectShow, versionShow} = this.state;
        let navWidth = scopeList.length === 2 ? "49.5%" : "33%"
        let navItemWidth
        if (scopeList.length === 1) {
            if (scopeList[0].list.length === 6) {
                navItemWidth = window.screen.availWidth / 6
            } else if (scopeList[0].list.length > 6) {
                navItemWidth = window.screen.availWidth / 6.5
            } else {
                navItemWidth = window.screen.availWidth / scopeList[0].list.length
            }
        }
        return (<div className="App">
            <div className="imgPanel">
                <img src={top_img} width="100%"/>
            </div>
            <Helmet>
                <meta name="description" content={pageDescription}/>
                <meta name="keywords" content={pageKeywords}/>
                <title>{pageTitle}</title>
            </Helmet>

            {/*筛选纬度大于一个时，需要用actionSheet来筛选课程*/}
            {scopeList.length > 1 && <div className="scopeArea">
                {scopeList.map((item, index) => {
                    let showIcon;
                    if (item.name === "年级") {
                        showIcon = gradeShow ?
                            "http://img.gankao.com/market/invitecards/1513321716075.PNG" :
                            "http://img.gankao.com/market/invitecards/1513321453700.PNG"
                    } else if (item.name === "科目") {
                        showIcon = subjectShow ?
                            "http://img.gankao.com/market/invitecards/1513321716075.PNG" :
                            "http://img.gankao.com/market/invitecards/1513321453700.PNG"
                    } else {
                        showIcon = versionShow ?
                            "http://img.gankao.com/market/invitecards/1513321716075.PNG" :
                            "http://img.gankao.com/market/invitecards/1513321453700.PNG"
                    }
                    return <div
                        style={{width: navWidth,}}
                        key={index}
                        className="scopeItem"
                        onClick={() => {
                            this.handleAction(item)
                            switch (item.name) {
                                case "年级":
                                    this.setState({gradeShow: true})
                                    break;
                                case "科目":
                                    this.setState({subjectShow: true})
                                    break;
                                default:
                                    this.setState({versionShow: true})
                            }
                        }
                        }>
                        <div className="grade" style={{fontSize: "10px", display: "flex"}}>
                            <span>{item.name}</span>
                            <img src={showIcon} width="16" alt=""/>
                        </div>
                        <div style={{fontSize: "15px"}}>
                            {(() => {
                                switch (item.name) {
                                    case "年级":
                                        return currentGrade
                                        break;
                                    case "科目":
                                        return currentSubject
                                        break;
                                    default:
                                        return currentVersion
                                }
                            })()}
                        </div>
                    </div>
                })}
            </div>}
            {scopeList.length === 1 &&
            <div className="singleScope">
                <div className="singleScopeBox" style={{width: navItemWidth * scopeList[0].list.length}}>
                    {scopeList[0].list.map((item, index) => {
                        return <div
                            key={index}
                            onClick={() => {
                                this.handleNavSingle(item, scopeList[0].name, index)
                            }}
                            style={{width: navItemWidth}}
                            className={`scopeItem${index === this.state.activedIndex ? ' activedIndex' : ''}`}>
                            {item}
                        </div>
                    })}
                </div>
            </div>
            }
            {/*符合选筛选条件的课程数目*/}
            {currentGrade !== "全部" || currentVersion !== "全部" || currentSubject !== "全部" && scopeList.length > 1 ?
                <div className="filterCounts">共{list2.length}个符合筛选条件的课程：</div> :
                ""
            }
            {/*<div className="loadMore"><LoadMore loading>数据加载中......</LoadMore> </div>:*/}
            {isLoading ?
                <div className="loadMore"><Toast icon="loading" show={true}>加载中...</Toast></div> :
                list2.map((item, index) => {
                    return <a href={courseSite + item.course.id} key={index} className="courseItem">
                        <div className="img">
                            <img
                                width="100%"
                                src={imgSite + item.course.title_pic}
                                alt=""/>
                        </div>
                        <div className="content">
                            <strong className="courseName">{item.course.name}</strong>
                            <div className="courseGrade">{item.course.grade.name}/{item.course.subject.name}</div>
                            <div className="courseView">{item.course.views}人学过</div>
                            <div className="coursePrice">￥{item.course.marked_price}元</div>

                        </div>
                        <div>
                            <img src="http://img.gankao.com/market/invitecards/1513321138373.PNG" width="50%" alt=""/>
                        </div>
                    </a>
                })
            }


            {/*年级的ActionSheet*/}
            <ActionSheet
                menus={this.state.gradeMenues}
                actions={this.state.gradeActions}
                show={this.state.gradeShow}
                type="ios"
                onRequestClose={e => this.setState({gradeShow: false})}
            />
            {/*科目的ActionSheet*/}
            <ActionSheet
                menus={this.state.subjectMenus}
                actions={this.state.subjectActions}
                show={this.state.subjectShow}
                type="ios"
                onRequestClose={e => this.setState({subjectShow: false})}
            />
            {/*版本的ActionSheet*/}
            <ActionSheet
                menus={this.state.versionMenus}
                actions={this.state.versionActions}
                show={this.state.versionShow}
                type="ios"
                onRequestClose={e => this.setState({versionShow: false})}
            />
        </div>);
    }
}

