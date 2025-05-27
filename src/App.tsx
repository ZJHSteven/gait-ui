// src/App.tsx
import React from 'react';
// 假设您的项目结构中，Chakra UI 的 Provider 设置在 @/components/ui/provider.tsx
// 正如 Chakra V3 文档中推荐的那样，它通常会组合 ChakraProvider 和 ColorModeProvider (来自 next-themes)
import { Provider as AppProvider } from '@/components/ui/provider'; //
import { Box, Flex, Heading, Link as ChakraLink } from '@chakra-ui/react'; // V3 直接从 @chakra-ui/react 导入
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';

// 页面组件 (稍后创建)
import ExperimentManagementPage from './pages/ExperimentManagementPage';
import ExperimentDataPage from './pages/ExperimentDataPage';

function App() {
  return (
    // AppProvider 通常包含了 ChakraProvider 和可能的 ColorModeProvider
    <AppProvider>
      <Router>
        <Box>
          {/* 顶部导航栏 - 使用 Chakra UI V3 组件 */}
          <Flex
            as="nav"
            align="center"
            justify="space-between"
            wrap="wrap"
            padding="1.5rem"
            bg="teal.500" // Chakra UI 颜色标记
            color="white"
          >
            <Flex align="center" mr={5}>
              <Heading as="h1" size="lg" letterSpacing={'-.1rem'}>
                步态分析平台
              </Heading>
            </Flex>
            <Box>
              {/* 使用 asChild 组合 ChakraLink 和 RouterLink (如果需要 Chakra UI 的样式应用到路由链接上) */}
              {/* 不过更简单的方式是直接用 ChakraLink 并用 to 属性 (如果 ChakraLink 支持直接的 to 属性或通过 as={RouterLink}) */}
              {/* 根据V3文档，更推荐的方式是直接使用 Next.js 的 Link 并用 asChild，但这里是纯React Router示例 */}
              <ChakraLink as={RouterLink} to="/" p={2} mr={4} _hover={{ textDecoration: 'none' }}>
                实验管理
              </ChakraLink>
            </Box>
          </Flex>

          {/* 页面内容区域 */}
          <Box p={8}>
            <Routes>
              <Route path="/" element={<ExperimentManagementPage />} />
              <Route path="/experiment/:experimentName/data" element={<ExperimentDataPage />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </AppProvider>
  );
}

export default App;