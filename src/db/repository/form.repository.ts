import {prisma} from '../prisma.js';

const getFormStructure =  async()=>{
   const categories = await prisma.autismCategory.findMany({
        orderBy:{id:'asc'},
        include:{
            questions:{
                orderBy:{order:'asc'},
                select:{
                    id:true,
                    question:true,
                    weight:true,
                    order:true
                }
            }
        }
    });
    return categories;
}

export default {
    getFormStructure
};