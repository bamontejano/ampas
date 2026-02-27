import {
    ShieldAlert,
    BrainCircuit,
    BookOpen,
    TriangleAlert,
    Smartphone,
    Users
} from 'lucide-react'

export const FORUM_CATEGORIES = [
    {
        id: 'adolescencia-limites',
        name: 'Adolescencia y Límites',
        desc: 'Estrategias de negociación, acuerdos y convivencia con adolescentes.',
        icon: ShieldAlert,
        color: 'bg-indigo-500',
        postCount: 24,
        lastPost: 'Hace 2h'
    },
    {
        id: 'educacion-emocional',
        name: 'Educación Emocional',
        desc: 'Gestión de emociones, frustración y autoestima en la familia.',
        icon: BrainCircuit,
        color: 'bg-emerald-500',
        postCount: 42,
        lastPost: 'Hace 15m'
    },
    {
        id: 'habitos-estudio',
        name: 'Hábitos de Estudio',
        desc: 'Técnicas de concentración, organización y motivación escolar.',
        icon: BookOpen,
        color: 'bg-blue-500',
        postCount: 18,
        lastPost: 'Ayer'
    },
    {
        id: 'tdah-neae',
        name: 'TDAH / NEAE',
        desc: 'Espacio de apoyo para Necesidades Específicas de Apoyo Educativo.',
        icon: TriangleAlert,
        color: 'bg-amber-500',
        postCount: 31,
        lastPost: 'Hace 4h'
    },
    {
        id: 'uso-pantallas',
        name: 'Uso de Pantallas',
        desc: 'Salud digital, redes sociales y prevención de adicciones.',
        icon: Smartphone,
        color: 'bg-rose-500',
        postCount: 56,
        lastPost: 'Hace 1h'
    },
    {
        id: 'bullying',
        name: 'Bullying y Convivencia',
        desc: 'Prevención del acoso escolar y fomento del respeto.',
        icon: Users,
        color: 'bg-purple-500',
        postCount: 12,
        lastPost: 'Hace 3d'
    }
]

export function getCategoryById(id: string) {
    return FORUM_CATEGORIES.find(cat => cat.id === id)
}
