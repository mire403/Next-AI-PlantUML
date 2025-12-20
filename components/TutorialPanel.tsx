import React from 'react';

const TutorialPanel: React.FC = () => {
  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">PlantUML 速成教程</h2>
          <p className="text-slate-600">
            无需拖拽，学习如何使用纯文本创建图表。
          </p>
        </div>

        {/* Section 1: Intro */}
        <section className="space-y-3">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-100 pb-1">什么是 PlantUML？</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            PlantUML 是一个开源工具，允许用户使用纯文本语言创建图表。
            它支持各种 UML 图（统一建模语言）和非 UML 图（JSON 数据、网络图等）。
          </p>
        </section>

        {/* --- UPDATED CONTENT START --- */}

        {/* 1. Classic UML */}
        <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-blue-500 pl-2">
                一、UML 经典图类型
            </h3>
            
            <TutorialItem 
                title="1. 类图 (Class Diagram)"
                desc="描述系统中的类、属性、方法以及类之间的关系。"
                elements="类、接口、属性、方法、继承、实现、关联、聚合、组合"
                code={`@startuml
class User {
  +id: int
  +name: String
  +login()
}

class Admin {
  +manageUser()
}

User <|-- Admin
@enduml`}
            />

            <TutorialItem 
                title="2. 时序图 (Sequence Diagram)"
                desc="描述对象或模块之间随时间变化的消息调用顺序。"
                elements="参与者、生命线、消息、同步 / 异步调用"
                code={`@startuml
actor User
participant Server
participant Database

User -> Server: request
Server -> Database: query
Database --> Server: result
Server --> User: response
@enduml`}
            />

            <TutorialItem 
                title="3. 用例图 (Use Case Diagram)"
                desc="展示系统功能以及参与者与系统功能之间的关系。"
                elements="参与者、用例、包含、扩展关系"
                code={`@startuml
actor User
actor Admin

User -- (Login)
User -- (Browse Data)
Admin -- (Manage System)
@enduml`}
            />

            <TutorialItem 
                title="4. 包图 (Package Diagram)"
                desc="描述系统的模块划分以及模块之间的依赖关系。"
                elements="包、依赖关系"
                code={`@startuml
package "UI Layer" {
  class Controller
}

package "Service Layer" {
  class UserService
}

Controller --> UserService
@enduml`}
            />

            <TutorialItem 
                title="5. 组件图 (Component Diagram)"
                desc="表示系统组件及组件之间的接口依赖关系。"
                elements="组件、接口、依赖关系"
                code={`@startuml
component WebApp
component AuthService
component Database

WebApp --> AuthService
AuthService --> Database
@enduml`}
            />
        </section>

        {/* 2. Behavior & State */}
        <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-blue-500 pl-2">
                二、行为与状态相关图
            </h3>

            <TutorialItem 
                title="6. 活动图 (Activity Diagram)"
                desc="描述流程或活动的执行顺序。"
                elements="开始、结束、动作、判断、并行"
                code={`@startuml
start
:Input Data;
if (Valid?) then (yes)
  :Process Data;
else (no)
  :Show Error;
endif
stop
@enduml`}
            />

            <TutorialItem 
                title="7. 状态图 (State Diagram)"
                desc="描述对象在生命周期中不同状态之间的转换。"
                elements="状态、事件、转换"
                code={`@startuml
[*] --> Idle
Idle --> Processing : start
Processing --> Done : finish
Done --> [*]
@enduml`}
            />

            <TutorialItem 
                title="8. 对象图 (Object Diagram)"
                desc="展示某一时刻对象实例及其属性值。"
                elements="对象、属性、实例关系"
                code={`@startuml
object user1 {
  id = 1
  name = "Alice"
}

object user2 {
  id = 2
  name = "Bob"
}

user1 -- user2
@enduml`}
            />
        </section>

        {/* 3. Deployment & Structure */}
        <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-blue-500 pl-2">
                三、部署与结构图
            </h3>

            <TutorialItem 
                title="9. 部署图 (Deployment Diagram)"
                desc="描述系统在硬件或运行环境中的部署结构。"
                elements="节点、设备、部署关系"
                code={`@startuml
node "Web Server" {
  component WebApp
}

node "DB Server" {
  component Database
}

WebApp --> Database
@enduml`}
            />
        </section>

        {/* 4. Extensions */}
        <section className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-l-4 border-blue-500 pl-2">
                四、PlantUML 扩展与工程常用图
            </h3>

            <TutorialItem 
                title="10. 流程图 (Flowchart)"
                desc="描述逻辑处理流程。"
                elements="步骤、判断、流程线"
                code={`@startuml
start
:Read Input;
if (OK?) then (yes)
  :Continue;
else (no)
  :Stop;
endif
stop
@enduml`}
            />

            <TutorialItem 
                title="11. ER 图 (Entity Relationship Diagram)"
                desc="描述数据库实体及其关系。"
                elements="实体、属性、主键、关系"
                code={`@startuml
entity User {
  +id : int
  --
  name : string
}

entity Order {
  +id : int
}

User ||--o{ Order
@enduml`}
            />

            <TutorialItem 
                title="12. C4 架构图 (Context / Container / Component)"
                desc="以不同层级描述系统架构。"
                elements="系统、容器、组件、关系"
                code={`@startuml
!include <C4/C4_Context>
Person(user, "User")
System(system, "AI UML System")
Rel(user, system, "uses")
@enduml`}
            />

            <TutorialItem 
                title="13. 甘特图 (Gantt Chart)"
                desc="展示任务计划和时间安排。"
                elements="任务、时间段、依赖关系"
                code={`@startuml
gantt
Project starts 2025-01-01
[Task A] lasts 5 days
[Task B] lasts 3 days
[Task B] starts after [Task A]
@enduml`}
            />

            <TutorialItem 
                title="14. 思维导图 (MindMap)"
                desc="展示层级化思维结构。"
                elements="节点、层级关系"
                code={`@startuml
mindmap
* UML
** Class Diagram
** Sequence Diagram
** Use Case Diagram
@enduml`}
            />

            <TutorialItem 
                title="15. 时间轴 (Timeline)"
                desc="按时间顺序展示事件。"
                elements="时间点、事件"
                code={`@startuml
timeline
2023 : Project Start
2024 : Development
2025 : Release
@enduml`}
            />

            <TutorialItem 
                title="16. 网络拓扑 / 架构图"
                desc="展示网络或系统组件连接关系。"
                elements="节点、连接关系"
                code={`@startuml
cloud Internet
node Server
database DB

Internet --> Server
Server --> DB
@enduml`}
            />
        </section>
        
        {/* --- UPDATED CONTENT END --- */}

        {/* Section 4: Tips */}
        <section className="space-y-3 pt-6 border-t border-slate-100">
          <h3 className="text-lg font-semibold text-blue-600 border-b border-blue-100 pb-1">新手提示</h3>
          <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
            <li>总是以 <code>@startuml</code> 开始，以 <code>@enduml</code> 结束。</li>
            <li>使用 <code>-&gt;</code> 表示同步消息，使用 <code>--&gt;</code> 表示返回消息。</li>
            <li>使用 <code>:</code> 定义继承（例如：<code>Dog : Animal</code>）。</li>
            <li>可以使用 HTML 十六进制代码添加颜色（例如：<code>#Red</code>）。</li>
          </ul>
        </section>

      </div>

      {/* STRICT FOOTER REQUIREMENT - COMPACT */}
      <div className="bg-slate-100 border-t border-slate-200 p-4 text-xs text-slate-700 space-y-2">
        <div className="flex flex-col gap-0.5">
             <div className="flex items-baseline gap-2">
                <span className="font-semibold text-slate-900">作者：</span>
                <span>Haoze Zheng</span>
             </div>
             <div className="flex items-baseline gap-2">
                <span className="font-semibold text-slate-900">联系方式：</span>
                <span className="font-mono text-slate-600">zhenghaoze@stu.xju.edu.cn</span>
             </div>
        </div>

        <div>
            <p className="font-semibold text-slate-900 mb-0.5">特别鸣谢：</p>
            <p className="text-slate-600 leading-tight">
            感谢开源社区、PlantUML 和 AI 模型让软件设计变得触手可及。
            </p>
        </div>

        <div>
            <p className="font-semibold text-slate-900 mb-0.5">GitHub：</p>
            <a 
            href="https://github.com/mire403/Next-AI-PlantUML" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-600 cursor-pointer hover:underline block break-all font-mono"
            >
            https://github.com/mire403/Next-AI-PlantUML
            </a>
        </div>

        <p className="italic font-medium text-slate-800 pt-1">
          如果您喜欢这个项目，请在 GitHub 上点个 ⭐！
        </p>
      </div>
    </div>
  );
};

// Helper Component for Tutorial Items
const TutorialItem: React.FC<{title: string, desc: string, elements?: string, code: string}> = ({title, desc, elements, code}) => (
    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
        <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
        <p className="text-xs text-slate-600 mb-2"><strong>用途：</strong>{desc}</p>
        {elements && <p className="text-xs text-slate-500 mb-2"><strong>常见元素：</strong>{elements}</p>}
        <div className="bg-white p-2 rounded border border-slate-200 mt-2">
            <code className="text-[10px] text-slate-800 whitespace-pre block font-mono overflow-x-auto">
{code}
            </code>
        </div>
    </div>
);

export default TutorialPanel;