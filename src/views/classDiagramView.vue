<template>
    <div class="class-diagram-page">
        <h1>類別圖</h1>

        <div class="template-selector">
            <h3>選擇模板</h3>
            <select v-model="selectedTemplate" @change="loadTemplate">
                <option value="simple">簡單類別圖</option>
                <option value="inheritance">繼承類別圖</option>
                <option value="relation">關係類別圖</option>
            </select>
        </div>

        <MermaidRenderer :initialCode="mermaidCode" ref="mermaidRenderer" />

        <div class="actions">
            <button @click="copyCode" class="btn">複製程式碼</button>
            <button @click="saveSVG" class="btn">下載 SVG</button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MermaidRenderer from '../components/MermaidRenderer.vue'

// 響應式數據
const mermaidCode = ref('')
const selectedTemplate = ref('simple')
const mermaidRenderer = ref(null)

// 模板庫
const templates = {
    simple: `classDiagram
      class Person {
        +String name
        +int age
        +getDetails() String
      }
      
      class Student {
        +int studentId
        +enrollCourse(courseId)
        +dropCourse(courseId)
      }`,

    inheritance: `classDiagram
      class Animal {
        +String species
        +feed() void
        +makeSound() String
      }
      
      class Dog {
        +String breed
        +wagTail() void
      }
      
      class Cat {
        +String color
        +purr() void
      }
      
      Animal <|-- Dog
      Animal <|-- Cat`,

    relation: `classDiagram
      class Course {
        +String title
        +String code
        +int credits
        +getDescription() String
      }
      
      class Teacher {
        +String name
        +String employeeId
        +assignGrade() void
      }
      
      class Student {
        +String name
        +String studentId
        +submitAssignment() void
      }
      
      class Department {
        +String name
        +addCourse() void
        +removeCourse() void
      }
      
      Department "1" --> "*" Course : offers
      Teacher "1" --> "*" Course : teaches
      Student "*" --> "*" Course : enrolls`
}

// 生命週期鉤子
onMounted(() => {
    loadTemplate()
})

// 加載選中的模板
const loadTemplate = () => {
    mermaidCode.value = templates[selectedTemplate.value]
}

// 複製程式碼到剪貼板
const copyCode = () => {
    if (mermaidRenderer.value) {
        const code = mermaidRenderer.value.getCode()
        navigator.clipboard.writeText(code)
            .then(() => alert('已複製到剪貼板'))
            .catch(err => console.error('複製失敗:', err))
    }
}

// 儲存 SVG
const saveSVG = () => {
    try {
        const svgElement = document.querySelector('.mermaid-preview svg')
        if (svgElement) {
            const svgData = new XMLSerializer().serializeToString(svgElement)
            const blob = new Blob([svgData], { type: 'image/svg+xml' })
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.href = url
            a.download = `class-diagram-${Date.now()}.svg`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)
        }
    } catch (error) {
        console.error('SVG 下載失敗:', error)
    }
}
</script>

<style scoped>
.class-diagram-page {
    max-width: 1200px;
    margin: 0 auto;
}

.template-selector {
    margin-bottom: 20px;
}

select {
    width: 200px;
}

.actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
}
</style>