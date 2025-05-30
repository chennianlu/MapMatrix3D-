import { factory } from "../object/factory";
import { ObjectType } from "../object";


interface QueryOption {
    classID: string,
    className: string,
}

export type QueryParam = string | QueryOption
/**
 * 根据查询条件对物体进行过滤
 * QuerySelector用于提供多种过滤物体的方式，例如id  name  classID
 */
export class QuerySelector {

    static query(filter: QueryParam): ObjectType | null {
        if (typeof filter === 'string') {
            return factory.getObjectByID(filter);
        } else {
            // TODO 先不支持，后续根据实际需求细节设计
            return this.advancedQuery(filter)
        }

    }

    /**
     * 高级查询功能 未实现
     * @param filter 
     * @returns 
     */
    private static advancedQuery(filter): null {
        // filter={
        //     type:'Cell',
        //     'alarm':''
        // }
        return null
    }


}
